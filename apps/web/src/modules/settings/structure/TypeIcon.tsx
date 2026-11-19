import type { UnitType } from '@erxes/core-contract';
import { IconBuildingCommunity, IconHierarchy } from '@tabler/icons-react';
import { cn, IconComponent } from 'erxes-ui';

const BOXES = { sm: 'size-5', md: 'size-7', lg: 'size-9' };

type Size = keyof typeof BOXES;

/** The type's own icon, else the hierarchy one; the organisation, which has no type, the building. */
const Glyph = ({ type, size }: { type: TypeLook | undefined; size: Size }) => {
  if (type?.icon) {
    if (size === 'lg') return <IconComponent name={type.icon} className="size-5" />;

    if (size === 'md') return <IconComponent name={type.icon} className="size-4" />;

    return <IconComponent name={type.icon} className="size-3.5" />;
  }

  const Fallback = type ? IconHierarchy : IconBuildingCommunity;

  return <Fallback className={size === 'lg' ? 'size-5' : size === 'md' ? 'size-4' : 'size-3.5'} />;
};

type TypeLook = Pick<UnitType, 'icon' | 'color' | 'name'>;

/** A unit type's icon on a chip tinted with its colour. */
export const TypeIcon = ({ type, size = 'md' }: { type: TypeLook | undefined; size?: Size }) => {
  const cssVariables: Record<`--${string}`, string> = {
    '--type-color': type?.color ?? 'var(--color-primary)',
  };

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-(--type-color)/12 text-(--type-color)',
        BOXES[size],
      )}
      style={cssVariables}
      aria-hidden
    >
      <Glyph type={type} size={size} />
    </span>
  );
};
