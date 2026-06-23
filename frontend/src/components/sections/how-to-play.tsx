'use client';

import { Reveal, RevealGroup, RevealItem } from '../ui/reveal';

const STEPS = [
  {
    n: '01',
    title: 'Crea una sala',
    body: 'Pulsa Crear sala y comparte el código de 5 dígitos. Tu grupo entra desde el móvil, sin instalar nada.',
  },
  {
    n: '02',
    title: 'Reparte en secreto',
    body: 'Todos reciben el mismo jugador secreto. Todos menos el impostor, que solo recibe una pista vaga y tendrá que improvisar.',
  },
  {
    n: '03',
    title: 'Caza al impostor',
    body: 'Por turnos, cada uno dice una palabra sobre el jugador. Debatís, sospecháis y votáis. ¿Quién no sabe de qué juega?',
  },
];

export function HowToPlay() {
  return (
    <section id="como-se-juega" className="mx-auto max-w-[1200px] px-5 py-28 sm:px-8 sm:py-36">
      <Reveal>
        <p className="font-display text-sm uppercase tracking-[0.2em] text-volt">Cómo se juega</p>
        <h2 className="mt-4 max-w-[16ch] font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
          Tres minutos para aprender. Toda la noche para discutir.
        </h2>
      </Reveal>

      <RevealGroup className="mt-16 divide-y divide-line border-t border-line">
        {STEPS.map((s) => (
          <RevealItem key={s.n}>
            <div className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-[120px_1fr] sm:gap-10">
              <span className="font-display text-5xl font-bold leading-none text-bone/15 sm:text-6xl">
                {s.n}
              </span>
              <div className="max-w-[52ch]">
                <h3 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-mute">{s.body}</p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
