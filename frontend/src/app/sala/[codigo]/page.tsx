import type { Metadata } from 'next';
import { Lobby } from '@/components/lobby/lobby';

export const metadata: Metadata = {
  title: 'Sala · Impostor Fútbol',
};

export default async function SalaPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <Lobby code={decodeURIComponent(codigo).toUpperCase()} />;
}
