import { Badge, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const IntegrationSteps = ({
  step,
  title,
  stepsLength,
  description,
  className,
}: {
  step: number;
  title: string;
  stepsLength: number;
  description?: string;
  className?: string;
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
      {description && (
        <div className="text-xs text-accent-foreground">{description}</div>
      )}
    </div>
  );
};
