import { useAutomation } from '@/automations/context/AutomationProvider';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useState } from 'react';
import { SubmitErrorHandler, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type AutomationStatus = TAutomationBuilderForm['status'];

export const useAutomationBuilderStatusSwitcher = ({
  onError,
  onSave,
}: {
  onSave: (values: TAutomationBuilderForm) => Promise<unknown>;
  onError: SubmitErrorHandler<TAutomationBuilderForm>;
}) => {
  const { isCreatePage } = useAutomation();

  const { control, getValues, handleSubmit, setValue } =
    useFormContext<TAutomationBuilderForm>();
  const [pendingStatus, setPendingStatus] = useState<AutomationStatus | null>(
    null,
  );
  const { t } = useTranslation('automations');
  const isActivating = pendingStatus === 'active';

  const handleConfirm = () => {
    if (!pendingStatus) {
      return;
    }

    setValue('status', pendingStatus, {
      shouldDirty: true,
      shouldTouch: true,
    });

    return handleSubmit(
      (values) => onSave({ ...values, status: pendingStatus }),
      onError,
    )();
  };
  return {
    getValues,
    t,
    isActivating,
    control,
    isCreatePage,
    pendingStatus,
    setPendingStatus,
    handleConfirm,
  };
};
