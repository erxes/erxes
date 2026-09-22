import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeleteCoupon } from '../../../hooks/useDeleteCoupon';

export const DeleteCoupon = ({ couponIds }: { couponIds: string[] }) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { removeCoupon } = useDeleteCoupon();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-coupon-confirm', { count: couponIds.length }),
        }).then(() => {
          removeCoupon({
            variables: { _ids: couponIds },
          })
            .then(() => {
              toast({
                title: t('coupons-deleted', { count: couponIds.length }),
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
