import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeleteDonation } from '../../../hooks/useDeleteDonation';

export const DeleteDonation = ({ donationIds }: { donationIds: string[] }) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { removeDonation } = useDeleteDonation();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-donation-confirm', 'Are you sure you want to delete {{count}} selected donation(s)?', { count: donationIds.length }),
        }).then(() => {
          removeDonation({
            variables: { _ids: donationIds },
          })
            .then(() => {
              toast({
                title: t('donations-deleted', '{{count}} donation(s) deleted successfully', { count: donationIds.length }),
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
