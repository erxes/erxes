import type { ComponentPropsWithoutRef } from 'react';

type InboxImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'alt'> & {
  alt: string;
};

// This application is bundled with Rspack, so next/image is not available.
// Keeping the native image in one component also makes alt text mandatory.
export const InboxImage = ({ alt, ...props }: InboxImageProps) => (
  // skipcq: JS-W1015
  <img alt={alt} {...props} />
);
