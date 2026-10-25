import { IconComponent, cn } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';

type Props = {
  icon?: string | null;
  logo?: string | null;
  name: string;
  className?: string;
};

/** A connection's uploaded logo, or its icon from the erxes-ui set. */
export const ConnectionIcon = ({ icon, logo, name, className }: Props) => (
  <span
    className={cn(
      'flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-sm border bg-background',
      className,
    )}
  >
    {logo ? (
      <img
        src={readImage(logo, 64)}
        alt={`${name} logo`}
        className="size-full object-contain"
      />
    ) : (
      <IconComponent name={icon || 'IconPlug'} className="size-4" />
    )}
  </span>
);
