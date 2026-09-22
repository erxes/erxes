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
          message: t('delete-donation-confirm', { count: donationIds.length }),
        }).then(() => {
          removeDonation({
            variables: { _ids: donationIds },
          })
            .then(() => {
              toast({
                title: t('donations-deleted', { count: donationIds.length }),
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: t('error'),
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
