import { useAutomation } from '@/automations/context/AutomationProvider';
import { useClearUnsavedSegments } from '@/automations/hooks/useClearUnsavedSegments';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const useAutomationRefetch = () => {
  const {
    formState: { isDirty },
  } = useFormContext<TAutomationBuilderForm>();
  const { refetchDetail } = useAutomation();
  const { clearUnsavedSegments } = useClearUnsavedSegments();
  const { confirm } = useConfirm();
  const { t } = useTranslation('automations');
  const [refetching, setRefetching] = useState(false);

  const refetch = async () => {
    if (!refetchDetail) {
      return;
    }

    setRefetching(true);
    // Like leaving without saving: a failed cleanup must not block the refetch.
    await clearUnsavedSegments().catch(() => undefined);
    // Success remounts the builder; a failure shows the page's error state.
    await refetchDetail().catch(() => setRefetching(false));
  };

  const handleRefetch = () => {
    if (!isDirty) {
      void refetch();
      return;
    }

    confirm({
      message: t('unsaved-changes-title'),
      options: {
        description: t('refetch-unsaved-description'),
        okLabel: t('discard-and-refetch'),
        cancelLabel: t('stay-here'),
      },
    }).then(refetch);
  };

  return { canRefetch: Boolean(refetchDetail), refetching, handleRefetch };
};
