import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import lighthouse from '@lighthouse-web3/sdk';
import * as anchor from '@coral-xyz/anchor';
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { connection, PROGRAM_ID, getProvider, getUserProfilePda, getFileRecordPda, getConfigPda, LIGHTHOUSE_API_KEY } from '@/lib/solana';
import { IDL } from '@/lib/idl';
import * as crypto from 'crypto-js';

interface UploadStep {
  step: number;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export const FileUpload = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<UploadStep[]>([
    { step: 1, label: 'Select file', status: 'pending' },
    { step: 2, label: 'Upload to IPFS', status: 'pending' },
    { step: 3, label: 'Create file record', status: 'pending' },
    { step: 4, label: 'Register storage', status: 'pending' },
    { step: 5, label: 'Finalize file', status: 'pending' },
  ]);

  const updateStep = (stepNum: number, status: UploadStep['status']) => {
    setSteps(prev => prev.map(s => s.step === stepNum ? { ...s, status } : s));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      updateStep(1, 'completed');
      toast({
        title: "File selected",
        description: `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    }
  };

  const uploadToIPFS = async (file: File) => {
    updateStep(2, 'processing');
    try {
      const output = await lighthouse.upload([file], LIGHTHOUSE_API_KEY);
      const cid = output.data.Hash;
      updateStep(2, 'completed');
      return cid;
    } catch (error) {
      updateStep(2, 'error');
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!file || !publicKey) {
      toast({
        title: "Error",
        description: "Please connect wallet and select a file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Step 2: Upload to IPFS via Lighthouse
      const ipfsCid = await uploadToIPFS(file);
      
      // Calculate file hash
      const fileBuffer = await file.arrayBuffer();
      const wordArray = crypto.lib.WordArray.create(new Uint8Array(fileBuffer));
      const hash = crypto.SHA256(wordArray);
      const fileHash = Array.from(new Uint8Array(hash.words.flatMap(word => [
        (word >> 24) & 0xff,
        (word >> 16) & 0xff,
        (word >> 8) & 0xff,
        word & 0xff
      ])));

      // Calculate chunk count (1MB chunks)
      const chunkSize = 1024 * 1024;
      const chunkCount = Math.ceil(file.size / chunkSize);

      const provider = getProvider(wallet);
      if (!provider) throw new Error('Provider not available');

      const program = new anchor.Program(IDL as any, PROGRAM_ID as any, provider as any);

      // Get PDAs
      const userProfilePda = getUserProfilePda(publicKey);
      const fileRecordPda = getFileRecordPda(publicKey, file.name);
      const configPda = getConfigPda();

      // Check if user profile exists, create if not
      try {
        const accountInfo = await connection.getAccountInfo(userProfilePda);
        if (!accountInfo) {
          toast({
            title: "Creating user profile",
            description: "First time setup...",
          });
          await program.methods
            .createUserProfile()
            .accounts({
              userProfile: userProfilePda,
              user: publicKey,
              systemProgram: SystemProgram.programId,
            })
            .rpc();
        }
      } catch (e) {
        console.log('Profile check error:', e);
      }

      // Step 3: Create file record
      updateStep(3, 'processing');
      const timestamp = new anchor.BN(Math.floor(Date.now() / 1000));
      
      await program.methods
        .createFile(
          file.name,
          new anchor.BN(file.size),
          fileHash,
          chunkCount,
          timestamp
        )
        .accounts({
          fileRecord: fileRecordPda,
          config: configPda,
          userProfile: userProfilePda,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      updateStep(3, 'completed');

      // Step 4: Register storage (IPFS CID)
      updateStep(4, 'processing');
      const merkleRoot = Array(32).fill(0); // Simplified for demo
      
      await program.methods
        .registerStorage(ipfsCid, merkleRoot)
        .accounts({
          fileRecord: fileRecordPda,
          owner: publicKey,
        })
        .rpc();
      updateStep(4, 'completed');

      // Step 5: Finalize file
      updateStep(5, 'processing');
      await program.methods
        .finalizeFile()
        .accounts({
          fileRecord: fileRecordPda,
          owner: publicKey,
        })
        .rpc();
      updateStep(5, 'completed');

      toast({
        title: "Upload successful!",
        description: `${file.name} uploaded to SolDrive`,
      });

      // Reset
      setFile(null);
      setSteps(steps.map(s => ({ ...s, status: 'pending' })));
      if (onUploadComplete) onUploadComplete();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Upload to SolDrive</h2>
          <p className="text-muted-foreground">Decentralized storage on Solana + IPFS</p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-1">
              {file ? file.name : 'Choose a file to upload'}
            </p>
            <p className="text-sm text-muted-foreground">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Click to select'}
            </p>
          </label>
        </div>

        {uploading && (
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.step} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                {step.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {step.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-muted" />}
                {step.status === 'error' && <div className="w-5 h-5 rounded-full bg-destructive" />}
                <span className={step.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading || !publicKey}
          variant="gradient"
          size="lg"
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload to SolDrive'
          )}
        </Button>
      </div>
    </Card>
  );
};
