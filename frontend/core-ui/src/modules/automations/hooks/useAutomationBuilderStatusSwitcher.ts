import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  TAutomationBuilderForm,
  TAutomationBuilderSaveValues,
} from '@/automations/utils/automationFormDefinitions';
import { useState } from 'react';
import { SubmitErrorHandler, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type AutomationStatus = TAutomationBuilderForm['status'];

export const useAutomationBuilderStatusSwitcher = ({
  onError,
  onSave,
}: {
  onSave: (values: TAutomationBuilderSaveValues) => Promise<unknown>;
  onError: SubmitErrorHandler<TAutomationBuilderForm>;
}) => {
  const { isCreatePage, detail } = useAutomation();

  const {
    control,
    getValues,
    handleSubmit,
    setValue,
    formState: { isDirty },
  } = useFormContext<TAutomationBuilderForm>();
  const [pendingStatus, setPendingStatus] = useState<AutomationStatus | null>(
    null,
  );
  const { t } = useTranslation('automations');
  const isActivating = pendingStatus === 'active';

  const isUntouchedDuplicate = !!detail?.duplicatedFrom && !isDirty;
  const duplicatedFromName = detail?.duplicatedFromName;

  const handleConfirm = () => {
    if (!pendingStatus) {
      return;
    }

    setValue('status', pendingStatus, {
      shouldDirty: true,
      shouldTouch: true,
    });

    const acknowledgeDuplicate = isActivating && isUntouchedDuplicate;

    return handleSubmit(
      (values) =>
        onSave({
          ...values,
          status: pendingStatus,
          ...(acknowledgeDuplicate && { acknowledgeDuplicate }),
        }),
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
    isUntouchedDuplicate,
    duplicatedFromName,
  };
};
