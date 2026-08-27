import { cn } from '@/modules/ui/lib/cn';

/** Nested hexagon outlines, sized to bleed off the top of an auth panel. */
export const AuthPattern = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 600 800"
    preserveAspectRatio="xMidYMin slice"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={cn(
      'pointer-events-none absolute inset-0 h-full w-full',
      className,
    )}
  >
    <path d="M300 -260 L560 -110 L560 190 L300 340 L40 190 L40 -110 Z" />
    <path d="M300 -150 L470 -52 L470 144 L300 242 L130 144 L130 -52 Z" />
    <path d="M300 -40 L380 6 L380 98 L300 144 L220 98 L220 6 Z" />
  </svg>
);
