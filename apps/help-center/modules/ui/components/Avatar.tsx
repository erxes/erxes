import { cn } from '@/modules/ui/lib/cn';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const Avatar = ({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn(
        'inline-block shrink-0 rounded-full bg-brand-soft object-cover',
        className,
      )}
    />
  ) : (
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
