import { cn } from 'erxes-ui';
import { Badge } from 'erxes-ui';

export const ErxesSteps = ({
  step,
  title,
  stepsLength,
  description,
  className,
}: {
  step: number;
  title: string;
  stepsLength: number;
  description: string;
  className?: string;
}) => {
  return (
    <div className={cn('flex flex-col gap-3 flex-none p-2', className)}>
      <div className="flex items-center gap-2">
        <Badge className="rounded-xl text-xs font-mono">STEP {step}</Badge>
        <h2 className="text-primary font-semibold text-base">{title}</h2>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: stepsLength }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full bg-border',
              step === index + 1 && 'bg-primary',
            )}
          />
        ))}
      </div>
      <div className="text-xs text-accent-foreground">{description}</div>
    </div>
  );
};
