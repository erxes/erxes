import React from 'react';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

// The size sets the initials' text size; a screen may resize the avatar itself.
const avatarVariants = cva('relative flex shrink-0 overflow-hidden border-0', {
  variants: {
    corners: {
      circle: 'rounded-full',
      // A person's own avatar: the account menu, a note's author.
      square: 'rounded-md',
    },
    // A ring of the page background, cutting the avatar out of what it overlaps: the next
    // avatar in a stack (sm), or a timeline's rail (lg).
    ring: {
      sm: 'bg-background ring-2 ring-background',
      lg: 'bg-background ring-4 ring-background',
    },
    size: {
      xs: 'size-3 text-4xs',
      sm: 'size-3.5 text-3xs',
      default: 'size-4 text-xs',
      lg: 'size-6 text-sm',
      xl: 'size-8 text-base',
    },
  },
  defaultVariants: {
    corners: 'circle',
    size: 'default',
  },
});

export type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>;

const AvatarRoot = ({ className, corners, ring, size, ...props }: AvatarProps) => (
  <AvatarPrimitive.Root
    className={cn(avatarVariants({ corners, ring, size }), className)}
    {...props}
  />
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
        'flex h-full w-full items-center justify-center uppercase bg-muted text-muted-foreground',
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
