import { cn } from '../lib/utils';

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  );
};

export const SkeletonArray = ({
  className,
  count,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  count: number;
}) => {
  return Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  ));
};
