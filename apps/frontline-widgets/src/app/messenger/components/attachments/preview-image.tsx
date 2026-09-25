import { cn } from 'erxes-ui';

export const PreviewImage = ({
  src,
  alt,
  fit = 'cover',
  className,
}: {
  src: string;
  alt: string;
  fit?: 'cover' | 'contain';
  className?: string;
}) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className={cn(fit === 'cover' ? 'object-cover' : 'object-contain', className)}
  />
);
