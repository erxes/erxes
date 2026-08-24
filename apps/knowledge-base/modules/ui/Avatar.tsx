import { cn } from '@/lib/cn';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const Avatar = ({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand',
      className,
    )}
  >
    {initialsOf(name) || '?'}
  </span>
);
