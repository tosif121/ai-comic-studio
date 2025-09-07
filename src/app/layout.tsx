import type { Metadata } from 'next';
import './globals.css';
import { Manrope } from 'next/font/google';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from '@/context/AppContext';

const Layout = dynamic(() => import('@/components/layout/Layout'));

export const metadata: Metadata = {
  title: 'AI Comic Studio - Transform Stories into Comics | Nano Banana Hackathon',
  description:
    'Create stunning comics with consistent characters in 60 seconds. Powered by Gemini 2.5 Flash Image for the Nano Banana Hackathon.',
  keywords: 'AI comic generator, story to comic, Nano Banana, Gemini 2.5 Flash, comic creation, voice input',
  openGraph: {
    title: 'AI Comic Studio - Voice to Comics in 60 Seconds',
    description: 'Transform any story into professional comics with consistent characters using AI',
    type: 'website',
  },
};

const manrope = Manrope({
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="antialiased bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 scroll-smooth font-manrope overflow-x-hidden">
        <AppProvider>
          <Layout>
            <Toaster
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
              }}
            />
            {children}
          </Layout>
        </AppProvider>
      </body>
    </html>
  );
}
