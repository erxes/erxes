import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useRemovePos } from '@/pos/hooks/usePosRemove';

interface PosItemDeleteProps {
  posItemIds: string;
  onDeleteSuccess?: () => void;
}

export const PosItemDelete = ({
  posItemIds,
  onDeleteSuccess,
}: PosItemDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePos } = useRemovePos();
  const { toast } = useToast();

  const posItemCount = posItemIds.includes(',')
    ? posItemIds.split(',').length
    : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${posItemCount} selected pos item?`,
        }).then(() => {
          removePos(posItemIds, {
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
                  posItemCount > 1
                    ? 'pos items deleted successfully.'
                    : 'pos item deleted successfully.'
                }`,
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
