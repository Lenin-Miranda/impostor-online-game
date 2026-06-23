'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * IntersectionObserver propio, de un solo disparo. Lo usamos en vez de
 * `whileInView` de Motion porque ese, en este proyecto, no estaba
 * disparando y dejaba el contenido invisible. Este observador dispara
 * también si el elemento ya está en pantalla al montar.
 */
function useInViewOnce<T extends HTMLElement>(amount = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: amount, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  return { ref, inView };
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** distancia de entrada en px (eje Y) */
  y?: number;
  as?: 'div' | 'section' | 'span' | 'li' | 'h2';
};

/** Entrada on-scroll: el contenido se desliza desde abajo y aparece. */
export function Reveal({ children, className, delay = 0, y = 28, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.2);
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={reduce ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Contenedor que escalona la entrada de sus hijos <RevealItem>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.15);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : stagger } },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.65, ease: EASE } },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
