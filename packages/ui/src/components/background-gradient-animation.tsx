import type { ReactNode } from 'react';
import { cn } from 'erxes-ui/lib/utils';

// Safari renders the SVG goo filter badly, so it gets a plain blur.
const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/** The moving colour blobs, each with its own orbit animation and opacity. */
const BLOBS = [
  'gradient-blob-1 animate-first',
  'gradient-blob-2 animate-second',
  'gradient-blob-3 animate-third',
  'gradient-blob-4 animate-fourth opacity-70',
  'gradient-blob-5 animate-fifth',
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

/** Slowly moving colour blobs behind `children` (components.css draws them). */
export const BackgroundGradientAnimation = ({
  children,
  className,
  containerClassName,
}: {
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
}) => (
  <div
    className={cn(
      'gradient-backdrop relative top-0 left-0 flex w-1/2 flex-col overflow-hidden',
      containerClassName,
    )}
  >
    <GooFilter />
    <div className={cn('absolute z-10 flex h-full w-full flex-col px-8 py-4', className)}>
      {children}
    </div>
    <div className={cn('h-full w-full', IS_SAFARI ? 'blur-2xl' : 'goo')}>
      {BLOBS.map((blob) => (
        <div key={blob} className={cn('gradient-blob', blob)} />
      ))}
    </div>
  </div>
);
