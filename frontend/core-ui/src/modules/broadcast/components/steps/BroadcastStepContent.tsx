import { Badge, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastSteps } from '../../context/BroadcastStepsContext';
import { BROADCAST_STEPS } from './broadcastStepConfig';

export const BroadcastStepContent = () => {
  const { t } = useTranslation('broadcasts');
  const { step } = useBroadcastSteps();
  const {
    titleKey,
    descriptionKey,
    content: StepContent,
  } = BROADCAST_STEPS[step];

  return (
    // The step is what scrolls; the sheet's own footer stays put.
    <div className="p-5 flex flex-col gap-5 h-full overflow-y-auto">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge className="rounded-xl text-xs font-mono">
            {t('steps.count', {
              step: step + 1,
              total: BROADCAST_STEPS.length,
            })}
          </Badge>
          <h2 className="text-primary font-semibold text-base">
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
