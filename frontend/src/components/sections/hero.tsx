"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ArrowRight, PlayCircle } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { Magnetic } from "../ui/magnetic";
import { FormationBoard } from "./formation-board";

const EASE = [0.16, 1, 0.3, 1] as const;

const line: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 },
  }),
};

const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.55 + i * 0.1 },
  }),
};

export function Hero() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(50);
  const my = useMotionValue(28);
  const flood = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgba(198,242,78,0.10), transparent 70%)`;

  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <section
      id="top"
      onPointerMove={onMove}
      className="relative flex min-h-[100dvh] items-center overflow-hidden pt-24 pb-16"
    >
      {/* Foco de estadio que sigue al cursor */}
      {!reduce && (
        <motion.div
          style={{ background: flood }}
          className="pointer-events-none absolute inset-0 z-0"
        />
      )}

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Columna de texto */}
        <div>
          <h1 className="font-display text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[0.98] tracking-[-0.03em]">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                custom={0}
                variants={reduce ? undefined : line}
                initial={reduce ? false : "hidden"}
                animate={reduce ? false : "show"}
              >
                Todos conocen
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.span
                className="block"
                custom={1}
                variants={reduce ? undefined : line}
                initial={reduce ? false : "hidden"}
                animate={reduce ? false : "show"}
              >
                al jugador.{" "}
                <span className="text-impostor italic">Uno finge.</span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            custom={0}
            variants={reduce ? undefined : fade}
            initial={reduce ? false : "hidden"}
            animate={reduce ? false : "show"}
            className="mt-7 max-w-[46ch] text-lg leading-relaxed text-mute"
          >
            El juego del impostor en clave fútbol. Todos reciben un jugador
            secreto. Uno no. Descúbrelo antes de que la cuele.
          </motion.p>

          <motion.div
            custom={1}
            variants={reduce ? undefined : fade}
            initial={reduce ? false : "hidden"}
            animate={reduce ? false : "show"}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Button href="/jugar" size="lg">
                Crear sala
                <ArrowRight weight="bold" className="size-[18px]" />
              </Button>
            </Magnetic>
            <Button href="#como-se-juega" variant="ghost" size="lg">
              <PlayCircle weight="bold" className="size-[18px]" />
              Cómo se juega
            </Button>
          </motion.div>
        </div>

        {/* Pizarrón de alineación */}
        <div className="flex justify-center lg:justify-end">
          <FormationBoard />
        </div>
      </div>
    </section>
  );
}
