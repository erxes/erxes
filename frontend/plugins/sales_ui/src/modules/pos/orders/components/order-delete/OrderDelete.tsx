import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useRemovePos } from '@/pos/hooks/usePosRemove';

interface OrderDeleteProps {
  orderIds: string;
  onDeleteSuccess?: () => void;
}

export const OrderDelete = ({
  orderIds,
  onDeleteSuccess,
}: OrderDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePos } = useRemovePos();
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
          removePos(orderIds, {
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
