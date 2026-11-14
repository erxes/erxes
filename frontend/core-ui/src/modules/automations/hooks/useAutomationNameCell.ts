import { AUTOMATION_EDIT } from '@/automations/graphql/automationMutations';
import { TAutomationRecordTableColumnDefData } from '@/automations/types';
import { ApolloError, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * An automation's name cell: opening it, and renaming it on Enter. A locked
 * automation the user cannot write opens only.
 */
export const useAutomationNameCell = (
  automation: TAutomationRecordTableColumnDefData,
) => {
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [edit] = useMutation(AUTOMATION_EDIT);
  const { _id: automationId, name: currentName } = automation;
  const [editingName, setEditingName] = useState(currentName);
  const lockState = automation.approvalLockState;
  const canWrite = !lockState?.locked || !!lockState.hasAccess;

  const rename = useCallback(() => {
    if (!canWrite || editingName === currentName || !editingName.trim()) {
      return;
    }

    edit({
      variables: { id: automationId, name: editingName },
      onError: (e: ApolloError) =>
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        }),
      onCompleted: () =>
        toast({
          title: t('success'),
          variant: 'success',
          description: t('automation-updated-success'),
        }),
    });
  }, [canWrite, editingName, currentName, edit, automationId, toast, t]);

  const openAutomation = useCallback(
    () => navigate(`/automations/edit/${automationId}`),
    [navigate, automationId],
  );

  return {
    automationId,
    currentName,
    editingName,
    setEditingName,
    canWrite,
    rename,
    openAutomation,
  };
};
