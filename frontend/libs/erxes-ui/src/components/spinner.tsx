import { cn } from 'erxes-ui/lib';
import { VariantProps, cva } from 'class-variance-authority';
import { useLoadingIndicator } from './loading-context';

const spinnerVariants = cva(
  'flex-col items-center justify-center flex-auto h-full',
  {
    variants: {
      show: {
        true: 'flex',
        false: 'hidden',
      },
    },
    defaultVariants: {
      show: true,
    },
  },
);

const loaderVariants = cva('relative', {
  variants: {
    size: {
      sm: 'size-3',
      default: 'size-4',
      md: 'size-5',
      lg: 'size-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const SPINNER_SPOKES = Array.from({ length: 10 }, (_, index) => ({
  animationDelay: `-${(10 - index) * 0.096}s`,
  rotation: index * 36 + 0.001,
}));

interface SpinnerContentProps
  extends
    VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  containerClassName?: string;
}

// skipcq: JS-D1001 - Covered by repository documentation policy.
export function Spinner({
  size,
  show,
  className,
  containerClassName,
}: SpinnerContentProps) {
  const isVisible = show !== false;

  useLoadingIndicator(isVisible);

  return (
    <div className={cn(spinnerVariants({ show }), containerClassName)}>
      <div className={cn(loaderVariants({ size }), className)}>
        <div className="relative size-full left-1/2 top-1/2">
          {SPINNER_SPOKES.map(({ animationDelay, rotation }) => (
            <div
              key={rotation}
              style={{
                transform: `translate(146%) rotate(${rotation}deg)`,
                animationDelay,
              }}
              className="absolute h-[8%] w-[24%] left-[-10%] top-[-3.9%] origin-[-100%] rounded-md bg-current animate-spinner "
            />
          ))}
        </div>
      </div>
    </div>
  );
}
