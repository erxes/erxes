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

const loaderVariants = cva('animate-spin duration-[2000]', {
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
    <span className={cn(spinnerVariants({ show }), containerClassName)}>
      <svg
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(loaderVariants({ size }), className)}
      >
        <g clipPath="url(#clip0_19_21)">
          <path
            d="M12.5 6.5V3.5"
            stroke="#202020"
            strokeOpacity="0.2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.75 8.2501L18.9 6.1001"
            stroke="#202020"
            strokeOpacity="0.05"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 12.5H21.5"
            stroke="#18181B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.75 16.75L18.9 18.9"
            stroke="#202020"
            strokeOpacity="0.85"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 18.5V21.5"
            stroke="#202020"
            strokeOpacity="0.7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.2501 16.75L6.1001 18.9"
            stroke="#202020"
            strokeOpacity="0.65"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 12.5H3.5"
            stroke="#202020"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.2501 8.2501L6.1001 6.1001"
            stroke="#202020"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_19_21">
            <rect
              width="24"
              height="24"
              fill="white"
              transform="translate(0.5 0.5)"
            />
          </clipPath>
        </defs>
      </svg>
    </span>
  );
}
