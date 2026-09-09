import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sailing Scoring',
  description: 'A simple, intuitive regatta scoring workspace for race committees.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
