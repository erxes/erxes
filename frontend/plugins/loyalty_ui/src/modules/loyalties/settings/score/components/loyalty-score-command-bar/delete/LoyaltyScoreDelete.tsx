import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeleteScore } from '../../../hooks/useLoyaltyScoreRowsRemove';

export const LoyaltyScoreDelete = ({ scoreIds }: { scoreIds: string[] }) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { removeScore } = useDeleteScore();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-score-confirm', 'Are you sure you want to delete {{count}} selected score campaign(s)?', { count: scoreIds.length }),
        }).then(() => {
          removeScore({
            variables: { _ids: scoreIds },
          })
            .then(() => {
              toast({
                title: t('scores-deleted', '{{count}} score campaign(s) deleted successfully', { count: scoreIds.length }),
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: t('error', 'Error'),
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      {t('delete', 'Delete')}
    </Button>
  );
};
