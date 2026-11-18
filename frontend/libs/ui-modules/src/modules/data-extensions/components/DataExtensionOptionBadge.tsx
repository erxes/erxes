import { cn } from 'erxes-ui';
import { DataExtensionOptionColor, IDataExtensionFieldOption } from '../types';

/** Dot and tint per option colour; 500 dots keep contrast on both themes. */
const COLOR_CLASSES: Record<
  DataExtensionOptionColor,
  { dot: string; badge: string }
> = {
  gray: { dot: 'bg-gray-400', badge: 'bg-gray-500/10 text-foreground' },
  red: { dot: 'bg-red-500', badge: 'bg-red-500/10 text-foreground' },
  orange: { dot: 'bg-orange-500', badge: 'bg-orange-500/10 text-foreground' },
  yellow: { dot: 'bg-yellow-500', badge: 'bg-yellow-500/15 text-foreground' },
  green: { dot: 'bg-green-500', badge: 'bg-green-500/10 text-foreground' },
  teal: { dot: 'bg-teal-500', badge: 'bg-teal-500/10 text-foreground' },
  blue: { dot: 'bg-blue-500', badge: 'bg-blue-500/10 text-foreground' },
  purple: { dot: 'bg-purple-500', badge: 'bg-purple-500/10 text-foreground' },
  pink: { dot: 'bg-pink-500', badge: 'bg-pink-500/10 text-foreground' },
};

export const OptionColorDot = ({
  color,
  className,
}: {
  color?: DataExtensionOptionColor | null;
  className?: string;
}) =>
  color ? (
    <span
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        COLOR_CLASSES[color]?.dot,
        className,
      )}
      aria-hidden="true"
    />
  ) : null;

/** A chosen option as a small badge; the label always carries the meaning. */
export const DataExtensionOptionBadge = ({
  option,
  className,
}: {
  option: IDataExtensionFieldOption;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs',
      option.color
        ? COLOR_CLASSES[option.color]?.badge
        : 'bg-muted text-foreground',
      className,
    )}
  >
    <OptionColorDot color={option.color} />
    {option.label}
  </span>
);
