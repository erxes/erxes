import { Badge, cn } from 'erxes-ui';

export const IntegrationSteps = ({
  step,
  title,
  stepsLength,
  description,
}: {
  step: number;
  title: string;
  stepsLength: number;
  description: string;
}) => {
  return (
    <div className="p-5 flex flex-col gap-3 flex-none">
      <div className="flex items-center gap-2">
        <Badge className="rounded-xl text-xs font-mono">STEP {step}</Badge>
        <h2 className="text-primary font-semibold text-base">{title}</h2>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: stepsLength }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full bg-muted',
              step === index + 1 && 'bg-primary',
            )}
          />
        ))}
      </div>
      <div className="text-xs text-accent-foreground">{description}</div>
    </div>
  );
};
