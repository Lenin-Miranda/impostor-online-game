import { SiteNav } from '@/components/sections/site-nav';
import { Hero } from '@/components/sections/hero';
import { HowToPlay } from '@/components/sections/how-to-play';
import { Features } from '@/components/sections/features';
import { TheTwist } from '@/components/sections/the-twist';
import { FinalCta } from '@/components/sections/final-cta';
import { SiteFooter } from '@/components/sections/site-footer';

export default function Home() {
  return (
    <div className="grain relative">
      <SiteNav />
      <main>
        <Hero />
        <HowToPlay />
        <Features />
        <TheTwist />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
