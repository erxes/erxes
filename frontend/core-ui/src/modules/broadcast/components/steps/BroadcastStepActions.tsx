import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastSteps } from '@/broadcast/context/BroadcastStepsContext';
export const BroadcastStepActions = () => {
  const { t } = useTranslation('broadcasts');
  const { isFirstStep, isLastStep, isScheduled, goPrevious, goNext, finish } =
    useBroadcastSteps();
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
      )}
    >
      <Button onClick={goPrevious} variant="secondary">
        {t(isFirstStep ? 'steps.cancel' : 'steps.previous')}
      </Button>
      {isLastStep && (
        <Button onClick={() => finish('draft')} variant="secondary">
          {t('steps.save-draft')}
        </Button>
      )}
      {isLastStep ? (
        <Button onClick={() => finish(isScheduled ? 'schedule' : 'live')}>
          {t(isScheduled ? 'steps.save-schedule' : 'steps.save-live')}
        </Button>
      ) : (
        <Button onClick={goNext}>{t('steps.next')}</Button>
      )}
    </div>
  );
};
