import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodeIssues } from '@/automations/hooks/useAutomationNodeIssues';
import {
  TAutomationBuilderForm,
  TAutomationBuilderSaveValues,
} from '@/automations/utils/automationFormDefinitions';
import { toast } from 'erxes-ui';
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
  const { isCreatePage, detail, reactFlowInstance } = useAutomation();
  const { nodeIssues } = useAutomationNodeIssues();

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

  // A flow with steps still missing configuration may be kept as a draft but
  // never put live; the first such step is brought into view.
  const requestStatus = (nextStatus: AutomationStatus) => {
    if (nextStatus === getValues('status')) {
      return;
    }

    if (nextStatus === 'active' && nodeIssues.length) {
      const [first] = nodeIssues;

      toast({
        title: t('activate-blocked-title', { count: nodeIssues.length }),
        description: `${first.label}: ${first.issues.join(', ')}`,
        variant: 'destructive',
      });

      reactFlowInstance?.fitView({
        nodes: [{ id: first.nodeId }],
        duration: 800,
      });

      return;
    }

    setPendingStatus(nextStatus);
  };

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
    requestStatus,
    handleConfirm,
    isUntouchedDuplicate,
    duplicatedFromName,
  };
};
