import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Impostor Fútbol',
  description: 'El juego del impostor de fútbol para jugar con amigos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
