import { cn } from 'erxes-ui/lib';
import { VariantProps, cva } from 'class-variance-authority';

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
      md: 'size-6',
      lg: 'size-8',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface SpinnerContentProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  containerClassName?: string;
}

export function Spinner({
  size,
  show,
  className,
  containerClassName,
}: SpinnerContentProps) {
  return (
    <div className={cn(spinnerVariants({ show }), containerClassName)}>
      <div className={cn(loaderVariants({ size }), className)}>
        <div className="relative size-full left-1/2 top-1/2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                transform: `translate(146%) rotate(${i * 30 + 0.001}deg)`,
                animationDelay: `-${(12 - i) * 0.08}s`,
              }}
              className="absolute h-[8%] w-[24%] left-[-10%] top-[-3.9%] origin-[-100%] rounded-md bg-current animate-spinner "
            />
          ))}
        </div>
      </div>
    </div>
  );
}
