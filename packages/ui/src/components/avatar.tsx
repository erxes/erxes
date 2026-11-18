import React from 'react';

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

/** A `span`'s props plus `corners`, `ring` and `size`. */
export type AvatarProps = React.ComponentProps<'span'> & VariantProps<typeof avatarVariants>;

const AvatarRoot = ({ className, corners, ring, size, ...props }: AvatarProps) => (
  <span
    className={cn('group/avatar', avatarVariants({ corners, ring, size }), className)}
    {...props}
  />
);

// The picture shows once the browser has loaded it, and the initials until then or when it
// fails. Only the img's own load and error events change that, once per address, and the
// initials hide by CSS, so drawing many avatars at once can't start a chain of renders.
// Without `alt` the picture is decorative: the name is beside it.
const AvatarImage = ({
  className,
  src,
  alt = '',
  onLoad,
  onError,
  ...props
}: React.ComponentProps<'img'>) => {
  const [loadedSrc, setLoadedSrc] = React.useState<string>();
  const loaded = Boolean(src) && loadedSrc === src;

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      data-loaded={loaded ? '' : undefined}
      onLoad={(event) => {
        setLoadedSrc(src);
        onLoad?.(event);
      }}
      onError={(event) => {
        setLoadedSrc(undefined);
        onError?.(event);
      }}
      className={cn('aspect-square h-full w-full object-cover', className, !loaded && 'hidden')}
      {...props}
    />
  );
};

const AvatarFallback = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    className={cn(
      'flex h-full w-full items-center justify-center uppercase bg-muted text-muted-foreground group-has-data-loaded/avatar:hidden',
      className,
    )}
    {...props}
  />
);

/** A person's picture, round or square, falling back to their initials. */
export const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
