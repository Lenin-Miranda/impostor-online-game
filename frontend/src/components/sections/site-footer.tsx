const LINKS = [
  { label: 'Cómo se juega', href: '#como-se-juega' },
  { label: 'El juego', href: '#el-juego' },
  { label: 'El twist', href: '#el-twist' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-volt font-display text-sm font-bold text-ink">
            11
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Impostor<span className="text-mute">.fútbol</span>
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-mute transition-colors hover:text-bone">
              {l.label}
            </a>
          ))}
        </nav>

        <p className="text-sm text-mute">
          Hecho para jugar con amigos · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
