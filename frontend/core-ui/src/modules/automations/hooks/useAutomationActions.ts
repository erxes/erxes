import { useDuplicateAutomation } from '@/automations/hooks/useDuplicateAutomation';
import { useRemoveAutomations } from '@/automations/hooks/useRemoveAutomations';
import { IAutomation } from '@/automations/types';
import { ApolloError } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type TActionableAutomation = Pick<
  IAutomation,
  '_id' | 'name' | 'approvalLockState'
>;

/** Edit, duplicate and delete shared by the table row and the card. */
export const useAutomationActions = (automation: TActionableAutomation) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('automations');
  const { removeAutomations, loading: removing } = useRemoveAutomations();
  const { duplicateAutomation, loading: duplicating } =
    useDuplicateAutomation();

  const { _id, name, approvalLockState } = automation;
  const canWrite = !approvalLockState?.locked || approvalLockState.hasAccess;

  const onError = (error: ApolloError) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });

  const onEdit = () => navigate(`/automations/edit/${_id}`);

  const onDuplicate = () =>
    duplicateAutomation(_id, {
      onError,
      onCompleted: ({
        automationsDuplicate,
      }: {
        automationsDuplicate?: { _id: string; name: string };
      }) =>
        toast({
          title: t('success'),
          variant: 'success',
          description: t('automation-duplicated', {
            name: automationsDuplicate?.name,
          }),
        }),
    });

  const onRemove = () =>
    confirm({
      message: t('automation-delete-confirm-message', { name }),
    }).then(() =>
      removeAutomations([_id], {
        onError,
        onCompleted: () =>
          toast({
            title: t('success'),
            variant: 'success',
            description: t('automations-deleted'),
          }),
      }),
    );

  return { canWrite, duplicating, removing, onEdit, onDuplicate, onRemove };
};
