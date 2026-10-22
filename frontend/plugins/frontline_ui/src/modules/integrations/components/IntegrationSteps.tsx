import { Badge, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const IntegrationSteps = ({
  step,
  title,
  stepsLength,
  description,
  className,
  stepLabels,
  onStepClick,
}: {
  step: number;
  title: string;
  stepsLength: number;
  description?: string;
  className?: string;
  // With these, each segment is a labelled button that jumps to its step.
  stepLabels?: string[];
  onStepClick?: (step: number) => void;
}) => {
  const { t, i18n } = useTranslation('frontline');
  const progressLabel = t('integration-step-progress', {
    step,
    total: stepsLength,
    defaultValue: i18n.resolvedLanguage?.startsWith('mn')
      ? '{{total}} алхмын {{step}}'
      : 'Step {{step}} of {{total}}',
  });

  return (
    <div className={cn('flex flex-none flex-col gap-3 p-4', className)}>
      <div className="flex items-center gap-2">
        <Badge className="rounded-full text-xs">{progressLabel}</Badge>
        <h2 className="text-primary font-semibold text-base">{title}</h2>
      </div>
      <progress
        className="sr-only"
        value={step}
        max={stepsLength}
        aria-label={progressLabel}
      />
      {onStepClick ? (
        <div className="flex items-start gap-1">
          {Array.from({ length: stepsLength }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onStepClick(index + 1)}
              aria-current={step === index + 1 ? 'step' : undefined}
              className="group flex flex-1 min-w-0 flex-col gap-1.5 pt-1 text-left"
            >
              <span
                className={cn(
                  'h-1 w-full rounded-full bg-border transition-colors group-hover:bg-primary/50',
                  step >= index + 1 && 'bg-primary group-hover:bg-primary',
                )}
              />
              {stepLabels?.[index] && (
                <span
                  className={cn(
                    'truncate text-xs text-muted-foreground group-hover:text-foreground',
                    step === index + 1 && 'font-medium text-primary',
                  )}
                >
                  {stepLabels[index]}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
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
      )}
      {description && (
        <div className="text-xs text-accent-foreground">{description}</div>
      )}
    </div>
  );
};
