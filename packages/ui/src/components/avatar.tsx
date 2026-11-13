import React from 'react';

import { Avatar as AvatarPrimitive } from 'radix-ui';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full border-0', {
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
});

export type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>;

const AvatarRoot = ({
  ref,
  className,
  size,
  ...props
}: AvatarProps & React.RefAttributes<React.ComponentRef<typeof AvatarPrimitive.Root>>) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ className, size }), className)}
    {...props}
  />
);

const AvatarImage = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
);

const AvatarFallback = ({
  ref,
  className,
  color,
  style,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
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
