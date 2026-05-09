import * as React from 'react';
import { cn } from 'erxes-ui';

export type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fit?: 'cover' | 'contain';
  rounded?: boolean;
};

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, fit = 'cover', rounded, alt = '', ...props }, ref) => (
    <img
      ref={ref}
      alt={alt}
      className={cn(
        'h-full w-full',
        fit === 'cover' ? 'object-cover' : 'object-contain',
        rounded && 'rounded-md',
        className,
      )}
      {...props}
    />
  ),
);
Image.displayName = 'Image';
