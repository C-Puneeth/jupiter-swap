import { AppLayout } from '@/components/ui/app-layout';
import { ClusterProvider } from '../components/cluster/cluster-data-access';
import { SolanaProvider } from '../components/solana/solana-provider';
import Head from 'next/head';
import './global.css';

export const metadata = {
  title: 'Jupiter Swap - Route Visualizer',
  description: 'Visualize Jupiter swap routes and liquidity pools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <script src="https://terminal.jup.ag/main-v2.js" data-preload></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <ClusterProvider>
          <SolanaProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </SolanaProvider>
        </ClusterProvider>
      </body>
    </html>
  );
}