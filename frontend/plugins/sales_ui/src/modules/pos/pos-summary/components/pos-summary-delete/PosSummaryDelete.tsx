import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeletePosSummary } from '@/pos/pos-summary/hooks/useDeletePosSummary';

interface PosSummaryDeleteProps {
  posSummaryIds: string;
  onDeleteSuccess?: () => void;
}

export const PosSummaryDelete = ({
  posSummaryIds,
  onDeleteSuccess,
}: PosSummaryDeleteProps) => {
  const { t } = useTranslation('sales');
  const { confirm } = useConfirm();
  const { removePosSummary } = useDeletePosSummary();
  const { toast } = useToast();

  const posSummaryCount = posSummaryIds.includes(',')
    ? posSummaryIds.split(',').length
    : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-pos-summary-confirm', 'Are you sure you want to delete the {{count}} selected pos summaries?', { count: posSummaryCount }),
        }).then(() => {
          removePosSummary(posSummaryIds, {
            onError: (e: ApolloError) => {
              toast({
                title: t('error', 'Error'),
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              toast({
                title: t('success', 'Success'),
                description: t('pos-summary-deleted', 'pos summary deleted successfully.'),
              });

              if (onDeleteSuccess) {
                onDeleteSuccess();
              }
            },
          });
        })
      }
    >
      <IconTrash />
      {t('delete', 'Delete')}
    </Button>
  );
};
