import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useDeleteCoupon } from '../../../hooks/useDeleteCoupon';

export const DeleteCoupon = ({ couponIds }: { couponIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeCoupon } = useDeleteCoupon();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${couponIds.length} selected coupon(s)?`,
        }).then(() => {
          removeCoupon({
            variables: { _ids: couponIds },
          })
            .then(() => {
              toast({
                title: `${couponIds.length} coupon(s) deleted successfully`,
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
