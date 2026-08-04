import { cva } from 'class-variance-authority';
import { cn } from 'erxes-ui';
import { ReactNode } from 'react';

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
  containerClassName?: string;
}

export const avatarVariants = cva(
  'inline-flex items-center justify-center rounded-full bg-muted font-medium text-foreground outline-1',
  {
    variants: {
      size: {
        xs: 'size-3 text-[8px]',
        sm: 'size-3.5 text-[10px]',
        default: 'size-4 text-xs',
        lg: 'size-6 text-sm',
        xl: 'size-8 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const sizeMap = {
  xs: 'size-3 text-[8px]',
  sm: 'size-3.5 text-[10px]',
  default: 'size-4 text-xs',
  lg: 'size-6 text-sm',
  xl: 'size-8 text-base',
};
export function AvatarGroup({
  children,
  max,
  size = 'default',
  className = '',
  containerClassName,
}: AvatarGroupProps) {
  const avatars = Array.isArray(children) ? children : [children];
  const displayAvatars =
    typeof max === 'number' ? avatars.slice(0, max) : avatars;
  const extraCount =
    typeof max === 'number' && avatars.length > max ? avatars.length - max : 0;

  return (
    <div className={`flex -space-x-2 ${containerClassName}`}>
      {extraCount > 0 && (
        <span className={cn(avatarVariants({ className, size }), className)}>
          +{extraCount}
        </span>
      )}
      {displayAvatars.map((child, idx) => (
        <div key={idx} className="inline-flex">
          {child}
        </div>
      ))}
    </div>
  );
}
