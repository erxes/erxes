import { useQueryState, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  BROADCAST_CONFIG_STEP,
  BROADCAST_STEPS,
  stepFields,
} from '../components/steps/broadcastStepConfig';
import { IBroadcastMethodEnum } from '../types';
import { TBroadcastAction } from '../utils/prepareBroadcastVariables';
import { isScheduleReady } from '../utils/scheduleForm';
import { IBroadcastFormData, useBroadcastForm } from './useBroadcastForm';
import { useBroadcastSubmit } from './useBroadcastSubmit';

export type TBroadcastStepsOptions = {
  /** Set when an existing campaign is edited through the same steps. */
  messageId?: string;
  initialValues?: Partial<IBroadcastFormData>;
  initialStep?: number;
  onExpand?: (values: IBroadcastFormData, step: number) => void;
  onClose: () => void;
};

export const useBroadcastStepsState = ({
  messageId,
  initialValues,
  initialStep = 0,
  onExpand,
  onClose,
}: TBroadcastStepsOptions) => {
  const [queryMethod] = useQueryState<IBroadcastMethodEnum>('method');
  const method = Object.values(IBroadcastMethodEnum).find(
    (value) => value === (initialValues?.method ?? queryMethod),
  );
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();
  const { form } = useBroadcastForm(initialValues);
  const { submit } = useBroadcastSubmit({ messageId, method });
  const [step, setStep] = useState(() =>
    Number.isInteger(initialStep) &&
    initialStep >= 0 &&
    initialStep < BROADCAST_STEPS.length
      ? initialStep
      : 0,
  );

  // The header decides what finishing does: a moment picked there turns the
  // send into a schedule, so there is never a choice to make at the bottom.
  const isScheduled = isScheduleReady(
    useWatch({ control: form.control, name: 'schedule' }),
  );

  const isStepValid = async () => {
    if (!(await form.trigger(stepFields(step, method)))) {
      return false;
    }

    if (method === 'notification' && step === BROADCAST_CONFIG_STEP) {
      const notification = form.getValues('notification');

      if (!notification?.inApp && !notification?.isMobile) {
        toast({
          variant: 'destructive',
          title: t('notification.no-channel'),
          description: t('notification.no-channel-body'),
        });

        return false;
      }
    }

    return true;
  };

  const goPrevious = () => {
    if (step === 0) {
      onClose();
      return;
    }

    setStep(step - 1);
  };

  const goNext = async () => {
    if (await isStepValid()) {
      setStep(step + 1);
    }
  };

  // An invalid form never reaches the callback, and a failed save keeps the
  // sheet open with everything written still in it.
  const finish = async (action: TBroadcastAction) => {
    if (!(await isStepValid())) {
      return;
    }

    await form.handleSubmit(async (data) => {
      if (await submit(data, action)) {
        onClose();
      }
    })();
  };

  return {
    form,
    messageId,
    method,
    isWorkflow: method === IBroadcastMethodEnum.WORKFLOW,
    step,
    isFirstStep: step === 0,
    isLastStep: step === BROADCAST_STEPS.length - 1,
    isScheduled,
    goPrevious,
    goNext,
    finish,
    expand: onExpand ? () => onExpand(form.getValues(), step) : undefined,
  };
};
