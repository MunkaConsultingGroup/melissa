import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Dad Insurance | Life Insurance Made Simple',
  description: 'Get personalized life insurance estimates in under 2 minutes. Compare rates from top-rated carriers.',
  other: {
    'impact-site-verification': '5e19d904-fef6-40fb-b24e-b53aeefd03e2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://utt.impactcdn.com" />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          id="impact-stat"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7018085-61bb-4054-8257-8771b0239f5d1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`,
          }}
        />
      </body>
    </html>
  );
}
