import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Button, Spinner, useConfirm, useToast } from 'erxes-ui';
import { IAutomation } from '@/automations/types';
import { Row } from '@tanstack/table-core';
import { useRemoveAutomations } from '@/automations/hooks/useRemoveAutomations';
import { useTranslation } from 'react-i18next';

export const AutomationRemoveButtonCommandBar = ({
  automationIds,
  rows,
}: {
  automationIds: string[];
  rows: Row<IAutomation>[];
}) => {
  const { confirm } = useConfirm();
  const { t } = useTranslation('automations');
  const { removeAutomations, loading } = useRemoveAutomations();
  const { toast } = useToast();
  const onRemove = () => {
    confirm({
      message: t('list-delete-selected-confirm', {
        count: automationIds.length,
      }),
    }).then(() => {
      removeAutomations(automationIds, {
        onError: (e: ApolloError) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          rows.forEach((row) => {
            row.toggleSelected(false);
          });
          toast({
            title: t('success'),
            variant: 'success',
            description: t('automations-deleted'),
          });
        },
      });
    });
  };
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={onRemove}
    >
      {loading ? <Spinner /> : <IconTrash />}
      {t('delete')}
    </Button>
  );
};
