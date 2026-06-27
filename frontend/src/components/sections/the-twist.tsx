'use client';

import { Reveal } from '../ui/reveal';
import { ScrambleText } from '../ui/scramble';

const NAMES = [
  'Mbappé', 'Haaland', 'Bellingham', 'Vini Jr', 'Rodri', 'Pedri',
  'Lamine Yamal', 'Modrić', 'Griezmann', 'Courtois',
];

function Strip() {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {NAMES.map((n, i) => (
        <span key={n} className="flex items-center gap-8">
          <span className="font-display text-2xl font-semibold text-bone/35 sm:text-3xl">{n}</span>
          {i === 4 && (
            <ScrambleText
              text="¿IMPOSTOR?"
              loop
              className="font-display text-2xl font-bold text-impostor sm:text-3xl"
            />
          )}
        </span>
      ))}
    </div>
  );
}

export function TheTwist() {
  return (
    <section id="el-twist" className="relative overflow-hidden border-y border-line bg-ink-2 py-28 sm:py-36">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal className="max-w-[24ch]">
          <h2 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-6xl">
            El impostor no sabe nada.
            <span className="text-impostor"> Y aun así tiene que hacerse pasar por uno más.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-7 max-w-[58ch]">
          <p className="text-lg leading-relaxed text-mute">
            Recibe una pista vaga y nada más. Tiene que leer la mesa, fingir que
            sabe y desviar la sospecha. Cuando funciona, es oro. Cuando lo descubres,
            también. Ese es todo el juego.
          </p>
        </Reveal>
      </div>

      {/* Marquee de nombres: el impostor se descifra en bucle */}
      <div className="relative mt-16 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex animate-marquee">
          <Strip />
          <Strip />
        </div>
      </div>
    </section>
  );
}
