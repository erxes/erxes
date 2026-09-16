import { Badge, cn } from 'erxes-ui';

export const IntegrationSteps = ({
  step,
  title,
  stepsLength,
  className,
}: {
  step: number;
  title: string;
  stepsLength: number;
  className?: string;
}) => {
  return (
    <div className={cn('flex flex-none flex-col gap-3 p-4', className)}>
      <div className="flex items-center gap-2">
        <Badge className="rounded-full text-xs">
          Step {step} of {stepsLength}
        </Badge>
        <h2 className="text-primary font-semibold text-base">{title}</h2>
      </div>
      <progress
        className="sr-only"
        value={step}
        max={stepsLength}
        aria-label={`Step ${step} of ${stepsLength}`}
      />
      <div className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: stepsLength }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full bg-border',
              step >= index + 1 && 'bg-primary',
            )}
          />
        ))}
      </div>
    </div>
  );
};
