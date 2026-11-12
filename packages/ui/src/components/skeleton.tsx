import { cn } from '../lib/utils';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('animate-pulse rounded-md bg-accent', className)} {...props} />;
};

export const SkeletonArray = ({
  className,
  count,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  count: number;
}) => {
  // The placeholders are identical, so a position is their identity.
  return [...Array(count).keys()].map((position) => (
    <div
      key={position}
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  ));
};
