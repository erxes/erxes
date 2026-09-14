import type { ComponentPropsWithoutRef } from 'react';

type InboxImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'alt'> & {
  alt: string;
};

export const InboxImage = ({ alt, ...props }: InboxImageProps) => (
  // skipcq: JS-W1015
  <img alt={alt} {...props} />
);
