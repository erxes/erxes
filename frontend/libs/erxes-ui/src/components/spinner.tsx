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
      md: 'size-5',
      lg: 'size-6',
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
  withMascot?: boolean;
}

const BOT_WHITE = '#FFFFFF';
const BOT_BODY = '#ECE9FB';
const BOT_LIMB = '#D9D3F5';
const BOT_GLOW = '#A78BFA';
const BOT_VISOR = '#2A1F5C';
const BOT_VISOR_SHINE = '#3D3180';
const BOT_DOTS = '#7F6BD6';

const FILL_BOX = '[transform-box:fill-box]';

// The erxes bot hugging its knees, rocking and glancing around while it waits.
const WaitingBot = ({ className }: { className?: string }) => (
  <div
    role="status"
    className={cn(
      'flex flex-col items-center gap-1 animate-bot-appear',
      className,
    )}
  >
    <svg viewBox="20 4 136 134" className="w-20" aria-hidden="true">
      <circle cx="80" cy="76" r="58" className="fill-primary/10" />
      <ellipse cx="80" cy="129" rx="44" ry="5" fill={BOT_GLOW} opacity="0.18" />
      <g className={cn(FILL_BOX, 'origin-bottom motion-safe:animate-bot-rock')}>
        <ellipse cx="80" cy="102" rx="32" ry="25" fill={BOT_BODY} />
        <ellipse cx="66" cy="108" rx="13" ry="18" fill={BOT_LIMB} />
        <ellipse cx="94" cy="108" rx="13" ry="18" fill={BOT_LIMB} />
        <path
          d="M60 98q-3 8 0 16"
          stroke={BOT_WHITE}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <ellipse cx="64" cy="125" rx="11" ry="6" fill={BOT_LIMB} />
        <ellipse cx="96" cy="125" rx="11" ry="6" fill={BOT_LIMB} />
        <circle cx="72" cy="104" r="7" fill={BOT_BODY} />
        <circle cx="88" cy="104" r="7" fill={BOT_BODY} />
        <circle cx="80" cy="52" r="33" fill={BOT_WHITE} />
        <path
          d="M53 64a29 29 0 0 0 38 19"
          stroke={BOT_BODY}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="55" y="37" width="50" height="29" rx="14.5" fill={BOT_VISOR} />
        <rect
          x="62"
          y="42"
          width="12"
          height="4"
          rx="2"
          fill={BOT_VISOR_SHINE}
        />
        <g className="motion-safe:animate-bot-glance">
          {[66, 84].map((x) => (
            <rect
              key={x}
              x={x}
              y="46"
              width="10"
              height="13"
              rx="5"
              fill={BOT_GLOW}
              className={cn(
                FILL_BOX,
                'origin-center motion-safe:animate-bot-blink',
              )}
            />
          ))}
        </g>
      </g>
      <g className="fill-background stroke-primary/20" strokeWidth="1.5">
        <circle cx="108" cy="31" r="2.5" />
        <circle cx="113" cy="25" r="3.5" />
        <rect x="115" y="8" width="38" height="18" rx="9" />
      </g>
      {[125, 134, 143].map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy="17"
          r="2.8"
          fill={BOT_DOTS}
          className="animate-bot-dots"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </svg>
    <span className="text-xs text-muted-foreground">Loading</span>
  </div>
);

export function Spinner({
  size,
  show,
  className,
  containerClassName,
  withMascot,
}: SpinnerContentProps) {
  if (withMascot) {
    return (
      <div className={cn(spinnerVariants({ show }), containerClassName)}>
        <WaitingBot className={className} />
      </div>
    );
  }

  return (
    <div className={cn(spinnerVariants({ show }), containerClassName)}>
      <div className={cn(loaderVariants({ size }), className)}>
        <div className="relative size-full left-1/2 top-1/2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                transform: `translate(146%) rotate(${i * 36 + 0.001}deg)`,
                animationDelay: `-${(10 - i) * 0.096}s`,
              }}
              className="absolute h-[8%] w-[24%] left-[-10%] top-[-3.9%] origin-[-100%] rounded-md bg-current animate-spinner "
            />
          ))}
        </div>
      </div>
    </div>
  );
}
