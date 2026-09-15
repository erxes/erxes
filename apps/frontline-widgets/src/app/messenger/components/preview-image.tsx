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
  <svg role="img" aria-label={alt} className={cn('block', className)}>
    <image
      href={src}
      width="100%"
      height="100%"
      preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
    />
  </svg>
);
