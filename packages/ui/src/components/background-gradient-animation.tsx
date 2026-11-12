import type { ReactNode } from 'react';
import { cn } from 'erxes-ui/lib/utils';

// Safari renders the SVG goo filter badly, so it gets a plain blur.
const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const BLOB_BASE =
  'absolute top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] h-[var(--size)] w-[var(--size)] [mix-blend-mode:var(--blending-value)]';

/** The moving colour blobs: their gradient, orbit origin, animation and opacity. */
const BLOBS = [
  {
    name: 'first',
    className:
      '[background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat] [transform-origin:center_center] animate-first opacity-100',
  },
  {
    name: 'second',
    className:
      '[background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat] [transform-origin:calc(50%-400px)] animate-second opacity-100',
  },
  {
    name: 'third',
    className:
      '[background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat] [transform-origin:calc(50%+400px)] animate-third opacity-100',
  },
  {
    name: 'fourth',
    className:
      '[background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat] [transform-origin:calc(50%-200px)] animate-fourth opacity-70',
  },
  {
    name: 'fifth',
    className:
      '[background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat] [transform-origin:calc(50%-800px)_calc(50%+800px)] animate-fifth opacity-100',
  },
];

const GooFilter = () => (
  <svg className="hidden">
    <defs>
      <filter id="blurMe">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
          result="goo"
        />
        <feBlend in="SourceGraphic" in2="goo" />
      </filter>
    </defs>
  </svg>
);

/** Slowly moving colour blobs behind `children`; colours are `r, g, b` triples. */
export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = 'rgb(108, 0, 162)',
  gradientBackgroundEnd = 'rgb(0, 17, 82)',
  firstColor = '18, 113, 255',
  secondColor = '221, 74, 255',
  thirdColor = '100, 220, 255',
  fourthColor = '200, 50, 50',
  fifthColor = '180, 180, 50',
  size = '80%',
  blendingValue = 'hard-light',
  children,
  className,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  size?: string;
  blendingValue?: string;
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const variables: Record<`--${string}`, string> = {
    '--gradient-background-start': gradientBackgroundStart,
    '--gradient-background-end': gradientBackgroundEnd,
    '--first-color': firstColor,
    '--second-color': secondColor,
    '--third-color': thirdColor,
    '--fourth-color': fourthColor,
    '--fifth-color': fifthColor,
    '--size': size,
    '--blending-value': blendingValue,
  };

  return (
    <div
      style={{ ...variables }}
      className={cn(
        'relative top-0 left-0 flex w-1/2 flex-col overflow-hidden bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]',
        containerClassName,
      )}
    >
      <GooFilter />
      <div className={cn('absolute z-10 flex h-full w-full flex-col px-8 py-4', className)}>
        {children}
      </div>
      <div
        className={cn(
          'gradients-container h-full w-full blur-lg',
          IS_SAFARI ? 'blur-2xl' : '[filter:url(#blurMe)_blur(40px)]',
        )}
      >
        {BLOBS.map((blob) => (
          <div key={blob.name} className={cn(BLOB_BASE, blob.className)} />
        ))}
      </div>
    </div>
  );
};
