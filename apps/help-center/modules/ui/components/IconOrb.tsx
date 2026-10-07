import { cn } from '@/modules/ui/lib/cn';
import { Icon, type IconName } from './Icon';

type Size = 'sm' | 'md';
type Tone = 'brand' | 'invert';

const orb: Record<Size, string> = {
  sm: 'size-10',
  md: 'size-12',
};

const glyph: Record<Size, number> = {
  sm: 17,
  md: 20,
};

const tones: Record<Tone, string> = {
  brand:
    'bg-brand-soft text-brand ring-brand-soft/40 group-hover:bg-brand group-hover:text-white group-hover:ring-brand/12 group-hover:shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--color-brand)_65%,transparent)]',
  invert:
    'bg-white/10 text-white ring-white/[0.06] group-hover:bg-white group-hover:text-shell group-hover:ring-white/15',
};

export const IconOrb = ({
  name,
  size = 'md',
  tone = 'brand',
  className,
}: {
  name: IconName;
  size?: Size;
  tone?: Tone;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex shrink-0 items-center justify-center rounded-full ring-4',
      'transition-[background-color,color,transform,box-shadow] duration-500 ease-out-soft group-hover:-rotate-6',
      tones[tone],
      orb[size],
      className,
    )}
  >
    <Icon name={name} size={glyph[size]} />
  </span>
);
