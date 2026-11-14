import { cn } from 'erxes-ui/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const spinnerVariants = cva('flex-col items-center justify-center flex-auto h-full', {
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
    /** Room around a spinner that stands in for a section (`sm`) or a page or panel body (`lg`). */
    area: {
      none: '',
      sm: 'py-6',
      lg: 'py-12',
    },
  },
  defaultVariants: {
    show: true,
    area: 'none',
  },
});

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

interface SpinnerContentProps
  extends VariantProps<typeof spinnerVariants>, VariantProps<typeof loaderVariants> {
  className?: string;
  containerClassName?: string;
}

/** The loader's ten spokes, by position. */
const SPOKES = [...Array(10).keys()];

export function Spinner({ size, show, area, className, containerClassName }: SpinnerContentProps) {
  return (
    <div className={cn(spinnerVariants({ show, area }), containerClassName)}>
      <div className={cn(loaderVariants({ size }), className)}>
        <div className="relative size-full left-1/2 top-1/2">
          {SPOKES.map((i) => (
            <div key={i} style={{ '--spoke': i }} className="spinner-spoke rounded-md bg-current" />
          ))}
        </div>
      </div>
    </div>
  );
}
