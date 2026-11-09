import { Badge, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastSteps } from '../../context/BroadcastStepsContext';
import { BROADCAST_CONFIG_STEP, BROADCAST_STEPS } from './broadcastStepConfig';

export const BroadcastStepContent = () => {
  const { t } = useTranslation('broadcasts');
  const { step } = useBroadcastSteps();
  const {
    titleKey,
    descriptionKey,
    content: StepContent,
  } = BROADCAST_STEPS[step];

  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col gap-5 p-5',
        step === BROADCAST_CONFIG_STEP ? 'overflow-y-auto' : 'overflow-hidden',
      )}
    >
      <div className="flex min-w-0 shrink-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge className="shrink-0 rounded-xl text-xs font-mono">
            {t('steps.count', {
              step: step + 1,
              total: BROADCAST_STEPS.length,
            })}
          </Badge>
          <h2 className="min-w-0 text-primary font-semibold text-base">
            {t(titleKey)}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {BROADCAST_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1 flex-1 rounded-full bg-muted',
                index <= step && 'bg-primary',
              )}
            />
          ))}
        </div>
        <div className="text-xs text-accent-foreground">
          {t(descriptionKey)}
        </div>
      </div>
      <StepContent />
    </div>
  );
};
