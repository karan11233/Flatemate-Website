import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatemate-ahmedabad.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Flatemate | Find Verified Flats & Flatmates in Ahmedabad',
  description:
    'Find verified shared flats, rooms, and flatmate replacements in Ahmedabad. Zero brokerage, real-time connects, direct host WhatsApp chat across Satellite, Vastrapur, Bodakdev, SG Highway.',
  keywords: [
    'flatmates in ahmedabad',
    'roommates in ahmedabad',
    'flats for rent in ahmedabad',
    'zero brokerage flats ahmedabad',
    'room replacement ahmedabad',
    'shared accommodation ahmedabad',
    'flatmate in satellite',
    'flatmate in vastrapur',
    'flatmate in prahlad nagar',
    'flatmate in bodakdev',
    'flat wanted ahmedabad',
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/assets/flatemate-logo-alt.jpg', type: 'image/jpeg' },
    ],
    apple: [{ url: '/assets/flatemate-logo-alt.jpg' }],
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Flatemate | Find Flats & Flatmates in Ahmedabad (0% Brokerage)',
    description:
      'Tired of broker fees? Find verified full flats, rooms, and flatmate replacements across Satellite, Vastrapur, Prahlad Nagar, and all Ahmedabad.',
    siteName: 'Flatemate',
    images: [
      {
        url: '/assets/flatemate-logo-alt.jpg',
        width: 800,
        height: 600,
        alt: 'Flatemate Ahmedabad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flatemate | Find Flats & Flatmates in Ahmedabad',
    description: 'Zero brokerage flatmate & flat discovery platform in Ahmedabad.',
    images: ['/assets/flatemate-logo-alt.jpg'],
  },
  other: {
    'geo.region': 'IN-GJ',
    'geo.placename': 'Ahmedabad',
    'geo.position': '23.0225;72.5714',
    'ICBM': '23.0225, 72.5714',
  },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <Script
          src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
