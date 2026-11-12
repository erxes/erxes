import { Badge, cn } from 'erxes-ui';

export const IntegrationSteps = ({
  step,
  steps,
}: Readonly<{
  step: number;
  steps: readonly { title: string; description: string }[];
}>) => {
  const current = steps[step - 1];
  const progressLabel = `Step ${step} of ${steps.length}`;

  return (
    <div className="flex flex-none flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Badge className="rounded-full text-xs">{progressLabel}</Badge>
        <h2 className="text-base font-semibold text-primary">
          {current?.title}
        </h2>
      </div>
      <progress
        className="sr-only"
        value={step}
        max={steps.length}
        aria-label={progressLabel}
      />
      <div className="flex items-center gap-1" aria-hidden="true">
        {steps.map((item, index) => (
          <div
            key={item.title}
            className={cn(
              'h-1 flex-1 rounded-full bg-border',
              step >= index + 1 && 'bg-primary',
            )}
          />
        ))}
      </div>
      {current?.description ? (
        <p className="text-xs text-accent-foreground">{current.description}</p>
      ) : null}
    </div>
  );
};
