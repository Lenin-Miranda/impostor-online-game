import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Impostor Fútbol · El juego del impostor para jugar con amigos',
  description:
    'Reparte jugadores, esconde a un impostor y descúbrelo antes de que marque. El juego del impostor con temática de fútbol para jugar en grupo.',
  openGraph: {
    title: 'Impostor Fútbol',
    description:
      'El juego del impostor con temática de fútbol. Crea una sala, comparte el código y caza al impostor.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
