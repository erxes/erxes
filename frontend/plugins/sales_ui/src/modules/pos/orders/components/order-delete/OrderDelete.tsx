import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useDeletePosOrder } from '@/pos/orders/hooks/useDeletePosOrder';

interface OrderDeleteProps {
  orderIds: string;
  onDeleteSuccess?: () => void;
}

export const OrderDelete = ({
  orderIds,
  onDeleteSuccess,
}: OrderDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePosOrder } = useDeletePosOrder();
  const { toast } = useToast();

  const orderCount = orderIds.includes(',') ? orderIds.split(',').length : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${orderCount} selected ${
            orderCount === 1 ? 'order' : 'orders'
          }?`,
        }).then(() => {
          removePosOrder(orderIds, {
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              toast({
                title: 'Success',
                description: `${
                  orderCount === 1 ? 'Order' : 'Orders'
                } deleted successfully.`,
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
      Delete
    </Button>
  );
};
