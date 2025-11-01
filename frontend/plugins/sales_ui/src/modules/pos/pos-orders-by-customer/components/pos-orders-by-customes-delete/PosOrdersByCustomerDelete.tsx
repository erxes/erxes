import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useRemovePos } from '@/pos/hooks/usePosRemove';

interface PosOrdersByCustomerDeleteProps {
  posOrdersByCustomerIds: string;
  onDeleteSuccess?: () => void;
}

export const PosOrdersByCustomerDelete = ({
  posOrdersByCustomerIds,
  onDeleteSuccess,
}: PosOrdersByCustomerDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePos } = useRemovePos();
  const { toast } = useToast();

  const posOrdersByCustomerCount = posOrdersByCustomerIds.includes(',')
    ? posOrdersByCustomerIds.split(',').length
    : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${posOrdersByCustomerCount} selected pos orders by customer?`,
        }).then(() => {
          removePos(posOrdersByCustomerIds, {
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
                description: `pos orders by customer deleted successfully.`,
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
