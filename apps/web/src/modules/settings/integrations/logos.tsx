import { cn } from 'erxes-ui';
import type { ComponentType } from 'react';

const FILES = import.meta.glob<string>('./logos/*.{png,svg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const BY_BRAND = new Map(
  Object.entries(FILES).map(([path, url]) => [path.replace(/^.*\/|\.\w+$/g, ''), url]),
);

const BRAND_OF: Record<string, string> = {
  'golomt-cgw': 'golomt',
  golomtcgw: 'golomt',
  'khanbank-cgw': 'khanbank',
  'tdb-cgw': 'tdb',
  tdbcgw: 'tdb',
  quickqr: 'qpay',
};

type Mark = ComponentType<{ className?: string }>;

const marks = new Map<string, Mark | null>();

const logoMark = (url: string): Mark => {
  const LogoMark = ({ className }: { className?: string }) => (
    <img src={url} alt="" className={cn('rounded-sm object-contain', className)} />
  );

  return LogoMark;
};

const initials = new Map<string, Mark>();

export const initialMark = (name: string): Mark => {
  const known = initials.get(name);

  if (known) return known;

  const InitialMark = ({ className }: { className?: string }) => (
    <span
      aria-hidden
      className={cn('flex items-center justify-center font-semibold leading-none', className)}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );

  initials.set(name, InitialMark);

  return InitialMark;
};

export const logoOf = (key: string): Mark | null => {
  if (!marks.has(key)) {
    const url = BY_BRAND.get(BRAND_OF[key] ?? key);

    marks.set(key, url ? logoMark(url) : null);
  }

  return marks.get(key) ?? null;
};
