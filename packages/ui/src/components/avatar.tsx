import React from 'react';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full border-0', {
  variants: {
    size: {
      xs: 'size-3 text-4xs',
      sm: 'size-3.5 text-3xs',
      default: 'size-4 text-xs',
      lg: 'size-6 text-sm',
      xl: 'size-8 text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>;

const AvatarRoot = ({ className, size, ...props }: AvatarProps) => (
  <AvatarPrimitive.Root className={cn(avatarVariants({ className, size }), className)} {...props} />
);

const AvatarImage = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
);

const AvatarFallback = ({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full uppercase bg-muted text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};

export const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
