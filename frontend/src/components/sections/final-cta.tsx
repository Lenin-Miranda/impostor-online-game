"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { Reveal } from "../ui/reveal";
import { Button } from "../ui/button";
import { Magnetic } from "../ui/magnetic";
import { BrandIcon } from "../ui/brand";

export function FinalCta() {
  return (
    <section
      id="crear-sala"
      className="relative flex min-h-[68vh] items-center overflow-hidden px-5 py-28 sm:px-8 sm:py-32"
    >
      {/* Resplandor de foco, detrás del titular */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[420px] w-[680px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(198,242,78,0.12),transparent_68%)]" />

      <div className="relative z-10 mx-auto max-w-[820px] text-center">
        <Reveal>
          <div className="mb-8 flex justify-center">
            <BrandIcon className="h-16 w-16 shadow-[0_24px_70px_-24px_var(--color-volt)]" />
          </div>
        </Reveal>
        <Reveal>
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.03em]">
            Reúne a tu equipo y encuentra al impostor.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-[46ch] text-lg text-mute">
            Crea una sala en segundos y pásale el código al grupo. La primera
            ronda empieza cuando estéis todos.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Magnetic strength={0.4}>
              <Button href="/jugar" size="lg">
                Crear sala
                <ArrowRight weight="bold" className="size-[18px]" />
              </Button>
            </Magnetic>
            <p className="font-display text-sm text-mute">
              Gratis, sin cuenta, desde el celular
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
