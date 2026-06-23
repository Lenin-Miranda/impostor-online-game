'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const GLYPHS = 'ABCDÆØ#%&_/0123456789↑↓◆▦░▒';

/**
 * Texto que se "descifra": arranca como ruido y se resuelve carácter
 * a carácter hasta el valor final. Si `loop` está activo, vuelve a
 * descifrarse cada cierto tiempo (el gesto del impostor).
 */
export function ScrambleText({
  text,
  className,
  loop = false,
  trigger = 'mount',
}: {
  text: string;
  className?: string;
  loop?: boolean;
  trigger?: 'mount' | 'inView';
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(reduce ? text : '');
  const frame = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(text);
      return;
    }

    let stopped = false;

    const run = () => {
      frame.current = 0;
      const steps = text.length * 3;

      const tick = () => {
        if (stopped) return;
        const progress = frame.current / steps;
        const revealed = Math.floor(progress * text.length);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') out += ' ';
          else if (i < revealed) out += text[i];
          else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplay(out);
        frame.current++;
        if (frame.current <= steps) {
          raf.current = requestAnimationFrame(tick);
        } else {
          setDisplay(text);
        }
      };
      tick();
    };

    const start = () => {
      run();
      if (loop) {
        const id = setInterval(run, 3600);
        return () => clearInterval(id);
      }
    };

    let cleanupLoop: (() => void) | undefined;

    if (trigger === 'inView' && ref.current) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            cleanupLoop = start();
            io.disconnect();
          }
        },
        { threshold: 0.6 },
      );
      io.observe(ref.current);
      return () => {
        stopped = true;
        io.disconnect();
        cancelAnimationFrame(raf.current);
        cleanupLoop?.();
      };
    }

    cleanupLoop = start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf.current);
      cleanupLoop?.();
    };
  }, [text, loop, reduce, trigger]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{display || text}</span>
    </span>
  );
}
