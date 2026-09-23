import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRemoveTopics } from '@/knowledgebase/topics/hooks/useTopicMutations';

export const TopicsDelete = ({ topicIds }: { topicIds: string[] }) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();
  const { removeTopics, loading } = useRemoveTopics();

  const handleDelete = () =>
    confirm({
      message: t('kb-confirm-delete-topics', {
        count: topicIds.length,
        defaultValue: 'Are you sure you want to delete {{count}} topics?',
      }),
      options: {
        confirmationValue: 'delete',
        description: t(
          'kb-action-permanent',
          'This action is permanent and cannot be undone.',
        ),
      },
    }).then(async () => {
      try {
        await removeTopics(topicIds);
        table.setRowSelection({});
        toast({
          title: t('success'),
          description: t('kb-topics-deleted', 'Topics deleted'),
          variant: 'success',
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
