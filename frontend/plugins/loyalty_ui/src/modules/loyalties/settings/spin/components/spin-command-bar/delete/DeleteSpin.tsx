import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeleteSpin } from '../../../hooks/useDeleteSpin';

export const DeleteSpin = ({ spinIds }: { spinIds: string[] }) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { removeSpin } = useDeleteSpin();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-spin-confirm', 'Are you sure you want to delete {{count}} selected spin(s)?', { count: spinIds.length }),
        }).then(() => {
          removeSpin({
            variables: { _ids: spinIds },
          })
            .then(() => {
              toast({
                title: t('spins-deleted', '{{count}} spin(s) deleted successfully', { count: spinIds.length }),
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
