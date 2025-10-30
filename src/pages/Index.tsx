import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletProvider } from '@/components/WalletProvider';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList';
import { Database, Shield, Zap } from 'lucide-react';

const IndexContent = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-lg bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold glow-text">SolDrive</h1>
                <p className="text-xs text-muted-foreground">Decentralized Storage</p>
              </div>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold mb-4 glow-text">
            Store Files on <span className="gradient-primary bg-clip-text text-transparent">Solana</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Decentralized storage powered by Solana blockchain and IPFS. Upload, share, and manage your files with complete ownership.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary transition-all">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Fully Decentralized</h3>
              <p className="text-sm text-muted-foreground">Your files are stored on IPFS with metadata on Solana</p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary transition-all">
              <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Powered by Solana's high-speed blockchain</p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary transition-all">
              <Database className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">You Own Your Data</h3>
              <p className="text-sm text-muted-foreground">Complete control with granular access management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <FileUpload onUploadComplete={() => setRefreshTrigger(prev => prev + 1)} />
        </div>
      </section>

      {/* Files Section */}
      <section className="container mx-auto px-4 py-12 mb-16">
        <div className="max-w-4xl mx-auto">
          <FileList refreshTrigger={refreshTrigger} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-lg mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="text-sm">
            Built on Solana • Stored on IPFS via Lighthouse • Fully Decentralized
          </p>
        </div>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <WalletProvider>
      <IndexContent />
    </WalletProvider>
  );
};

export default Index;
