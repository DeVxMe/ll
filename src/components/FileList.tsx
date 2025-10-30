import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { File, Share2, Lock, Unlock, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { connection, PROGRAM_ID, getProvider, getFileRecordPda, getSharedAccessPda } from '@/lib/solana';
import { IDL } from '@/lib/idl';

interface FileData {
  fileName: string;
  fileSize: number;
  primaryStorage: string;
  isPublic: boolean;
  status: any;
  createdAt: number;
  pda: PublicKey;
}

export const FileList = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { toast } = useToast();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareAddress, setShareAddress] = useState('');
  const [sharingFile, setSharingFile] = useState<FileData | null>(null);

  const loadFiles = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const provider = getProvider(wallet);
      if (!provider) return;

      const program = new anchor.Program(IDL as any, PROGRAM_ID as any, provider as any);
      
      // Fetch all file records for this user
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } }
        ]
      });

      const fileData: FileData[] = [];
      
      for (const account of accounts) {
        try {
          const data = program.coder.accounts.decode('fileRecord', account.account.data);
          if (data && data.fileName) {
            fileData.push({
              fileName: data.fileName,
              fileSize: data.fileSize ? data.fileSize.toNumber() : 0,
              primaryStorage: data.primaryStorage || '',
              isPublic: data.isPublic || false,
              status: data.status,
              createdAt: data.createdAt ? data.createdAt.toNumber() : Date.now() / 1000,
              pda: account.pubkey,
            });
          }
        } catch (e) {
          // Not a FileRecord account, skip
        }
      }

      setFiles(fileData.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [publicKey, refreshTrigger]);

  const togglePublic = async (file: FileData) => {
    if (!publicKey) return;

    try {
      const provider = getProvider(wallet);
      if (!provider) return;

      const program = new anchor.Program(IDL as any, PROGRAM_ID as any, provider as any);

      if (file.isPublic) {
        await program.methods
          .makePrivate()
          .accounts({
            fileRecord: file.pda,
            owner: publicKey,
          })
          .rpc();
        toast({ title: "File is now private" });
      } else {
        await program.methods
          .makePublic()
          .accounts({
            fileRecord: file.pda,
            owner: publicKey,
          })
          .rpc();
        toast({ title: "File is now public" });
      }

      loadFiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const shareFile = async () => {
    if (!publicKey || !sharingFile || !shareAddress) return;

    try {
      const sharedWithPubkey = new PublicKey(shareAddress);
      const provider = getProvider(wallet);
      if (!provider) return;

      const program = new anchor.Program(IDL as any, PROGRAM_ID as any, provider as any);
      const sharedAccessPda = getSharedAccessPda(sharingFile.pda, sharedWithPubkey);

      await program.methods
        .grantAccess(sharedWithPubkey, { read: {} }, null)
        .accounts({
          sharedAccess: sharedAccessPda,
          fileRecord: sharingFile.pda,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast({
        title: "Access granted!",
        description: `Shared ${sharingFile.fileName} with ${shareAddress.slice(0, 8)}...`,
      });

      setShareAddress('');
      setSharingFile(null);
    } catch (error: any) {
      toast({
        title: "Share failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: any) => {
    const statusKey = Object.keys(status)[0];
    const colors: any = {
      uploading: 'bg-yellow-500/20 text-yellow-500',
      processing: 'bg-blue-500/20 text-blue-500',
      active: 'bg-green-500/20 text-green-500',
      archived: 'bg-gray-500/20 text-gray-500',
      deleted: 'bg-red-500/20 text-red-500',
    };
    return (
      <Badge className={colors[statusKey] || 'bg-muted'}>
        {statusKey}
      </Badge>
    );
  };

  if (!publicKey) {
    return (
      <Card className="p-8 text-center bg-card">
        <p className="text-muted-foreground">Connect your wallet to view files</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 text-center bg-card">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your files...</p>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="p-8 text-center bg-card">
        <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No files uploaded yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Files</h2>
      {files.map((file) => (
        <Card key={file.pda.toString()} className="p-4 bg-card border-border hover:border-primary transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <File className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{file.fileName}</h3>
                  {getStatusBadge(file.status)}
                  {file.isPublic ? (
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      <Unlock className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(file.fileSize)} • {new Date(file.createdAt * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {file.primaryStorage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://gateway.lighthouse.storage/ipfs/${file.primaryStorage}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              
              <Dialog open={sharingFile?.pda === file.pda} onOpenChange={(open) => !open && setSharingFile(null)}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSharingFile(file)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share {file.fileName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Recipient's Solana address"
                      value={shareAddress}
                      onChange={(e) => setShareAddress(e.target.value)}
                    />
                    <Button onClick={shareFile} variant="gradient" className="w-full">
                      Grant Access
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePublic(file)}
              >
                {file.isPublic ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
