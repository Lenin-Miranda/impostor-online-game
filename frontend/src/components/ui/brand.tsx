import Image from 'next/image';

const APP_ICON = '/impostor-futbol-once-appicon.png';
const LOCKUP = '/impostor-futbol-once-lockup.png';

export function BrandIcon({ className = '' }: { className?: string }) {
  return (
    <Image
      src={APP_ICON}
      alt=""
      width={56}
      height={56}
      className={`shrink-0 rounded-[14px] ${className}`}
    />
  );
}

export function BrandLogo({
  href = '/',
  className = '',
}: {
  href?: string;
  className?: string;
}) {
  return (
    <a href={href} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <BrandIcon className="h-8 w-8 shadow-[0_10px_30px_-18px_var(--color-volt)]" />
      <span className="font-display text-[15px] font-semibold tracking-tight">
        Impostor<span className="text-mute">.fútbol</span>
      </span>
    </a>
  );
}

export function BrandLockup({
  className = '',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOCKUP}
      alt="Impostor.fútbol"
      width={313}
      height={84}
      priority={priority}
      className={`h-auto ${className}`}
    />
  );
}
