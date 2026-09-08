import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRemoveHelpCenters } from '@/helpcenter/hooks/useRemoveHelpCenters';

export const HelpCenterDelete = ({
  helpCenterIds,
}: {
  helpCenterIds: string[];
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();
  const { removeHelpCenters, loading } = useRemoveHelpCenters();

  const handleDelete = () =>
    confirm({
      message: t('kb-confirm-delete-topics', {
        count: helpCenterIds.length,
        defaultValue: 'Are you sure you want to delete {{count}} help centers?',
      }),
      options: {
        confirmationValue: 'delete',
        description: t('kb-action-permanent'),
      },
    }).then(async () => {
      try {
        await removeHelpCenters(helpCenterIds);
        table.setRowSelection({});
        toast({
          title: t('success'),
          variant: 'success',
          description: t('kb-topics-deleted', 'Help centers deleted'),
        });
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('something-went-wrong'),
          variant: 'destructive',
        });
      }
    });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
