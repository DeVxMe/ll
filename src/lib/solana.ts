import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

export const PROGRAM_ID = new PublicKey('CxDoRt3Nt5z747KNW6vkVxvQQ7c2dHMmGmoWNmxejA3f');
export const LIGHTHOUSE_API_KEY = 'f07e3012.7a601a169aee410eb50e3528bea9787d';

// Using devnet for development
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const getProvider = (wallet: any) => {
  if (!wallet || !wallet.publicKey) return null;
  
  const walletWrapper = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction?.bind(wallet),
    signAllTransactions: wallet.signAllTransactions?.bind(wallet) || (async (txs: any[]) => {
      if (wallet.signTransaction) {
        return Promise.all(txs.map(tx => wallet.signTransaction(tx)));
      }
      return txs;
    }),
  };
  
  return new anchor.AnchorProvider(
    connection,
    walletWrapper as any,
    { commitment: 'confirmed', preflightCommitment: 'confirmed' }
  );
};

export const getConfigPda = () => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );
  return pda;
};

export const getUserProfilePda = (userPubkey: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('user_profile'), userPubkey.toBuffer()],
    PROGRAM_ID
  );
  return pda;
};

export const getFileRecordPda = (ownerPubkey: PublicKey, fileName: string) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('file'),
      ownerPubkey.toBuffer(),
      Buffer.from(fileName)
    ],
    PROGRAM_ID
  );
  return pda;
};

export const getSharedAccessPda = (fileRecordPubkey: PublicKey, sharedWithPubkey: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('shared_access'),
      fileRecordPubkey.toBuffer(),
      sharedWithPubkey.toBuffer()
    ],
    PROGRAM_ID
  );
  return pda;
};
