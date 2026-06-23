"use client";

import {
  LockKey,
  UsersThree,
  Browser,
  Timer,
  SoccerBall,
} from "@phosphor-icons/react";
import { Reveal, RevealGroup, RevealItem } from "../ui/reveal";

const POOL = [
  "Messi",
  "Mbappé",
  "Haaland",
  "Bellingham",
  "Lamine Yamal",
  "Vini Jr",
  "Rodri",
  "Pedri",
  "Modrić",
  "Courtois",
  "Rüdiger",
  "Griezmann",
];
const HIGHLIGHT = new Set(["Bellingham", "Lamine Yamal", "Rodri"]);

const cardBase =
  "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-7 transition-colors duration-300 hover:border-bone/20";

export function Features() {
  return (
    <section
      id="el-juego"
      className="mx-auto max-w-[1200px] px-5 py-28 sm:px-8 sm:py-36"
    >
      <Reveal className="max-w-[40ch]">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-volt">
          El juego
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
          Pensado para la mesa, no para el tutorial.
        </h2>
      </Reveal>

      <RevealGroup
        className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6"
        stagger={0.07}
      >
        {/* A · temática fútbol con nube de nombres */}
        <RevealItem className="md:col-span-4 md:row-span-2">
          <article
            className={`${cardBase} min-h-[280px] h-full bg-gradient-to-br from-ink-2 to-surface`}
          >
            <div>
              <SoccerBall weight="fill" className="size-7 text-volt" />
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">
                Cientos de jugadores reales
              </h3>
              <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-mute">
                LaLiga, Premier, Serie A, Champions y leyendas. El jugador
                secreto cambia cada ronda, así nadie se lo aprende.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {POOL.map((name) => (
                <span
                  key={name}
                  className={`rounded-full border px-3 py-1 font-display text-[13px] ${
                    HIGHLIGHT.has(name)
                      ? "border-volt/40 bg-volt/10 text-volt"
                      : "border-line text-mute"
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
          </article>
        </RevealItem>

        {/* B · jugadores */}
        <RevealItem className="md:col-span-2">
          <article className={cardBase}>
            <UsersThree weight="bold" className="size-6 text-bone" />
            <div className="mt-6">
              <p className="font-display text-5xl font-bold leading-none">
                4-12
              </p>
              <p className="mt-2 text-[15px] text-mute">
                jugadores por sala. Ideal para una previa o una cena.
              </p>
            </div>
          </article>
        </RevealItem>

        {/* C · navegador */}
        <RevealItem className="md:col-span-2">
          <article className={cardBase}>
            <Browser weight="bold" className="size-6 text-bone" />
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                Solo el navegador
              </h3>
              <p className="mt-2 text-[15px] text-mute">
                Nada que instalar. Abres el enlace y juegas.
              </p>
            </div>
          </article>
        </RevealItem>

        {/* D · rondas */}
        <RevealItem className="md:col-span-3">
          <article className={cardBase}>
            <Timer weight="bold" className="size-6 text-bone" />
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                Rondas de 5 a 10 minutos
              </h3>
              <p className="mt-2 max-w-[38ch] text-[15px] text-mute">
                Partidas cortas y adictivas. Una más, y luego otra más.
              </p>
            </div>
          </article>
        </RevealItem>

        {/* E · salas privadas */}
        <RevealItem className="md:col-span-3">
          <article className={cardBase}>
            <LockKey weight="bold" className="size-6 text-bone" />
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                Salas privadas
              </h3>
              <p className="mt-2 max-w-[38ch] text-[15px] text-mute">
                Un código y solo entra tu gente. Sin desconocidos en la mesa.
              </p>
            </div>
          </article>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
