import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/** The corners follow what the skeleton stands in for. */
const skeletonVariants = cva('animate-pulse bg-accent', {
  variants: {
    radius: {
      default: 'rounded-md',
      /** An avatar. */
      circle: 'rounded-full',
      /** A chip or a square avatar. */
      sm: 'rounded-sm',
      /** A card. */
      lg: 'rounded-lg',
      /** A board column. */
      xl: 'rounded-xl',
    },
  },
  defaultVariants: {
    radius: 'default',
  },
});

/** A pulsing grey block that holds the place of content while it loads. */
export const Skeleton = ({
  className,
  radius,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof skeletonVariants>) => {
  return <div className={cn(skeletonVariants({ radius }), className)} {...props} />;
};

/** `count` skeletons of the same size, for a list's rows while it loads. */
export const SkeletonArray = ({
  count,
  ...props
}: React.ComponentProps<typeof Skeleton> & { count: number }) =>
  Array.from({ length: count }, (_, index) => <Skeleton key={index} {...props} />);
