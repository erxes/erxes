import { IconCheck } from '@tabler/icons-react';

const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** How many steps are answered, as a ring that fills; a check once full. */
export const TemplateProgressRing = ({
  done,
  total,
}: {
  done: number;
  total: number;
}) => {
  const ratio = total ? done / total : 1;

  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 44 44"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          strokeWidth="3"
          className="stroke-muted"
        />
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
        />
      </svg>
      {ratio === 1 ? (
        <IconCheck className="size-5 text-primary" />
      ) : (
        <span className="text-xs font-semibold tabular-nums">{done}</span>
      )}
    </span>
  );
};
