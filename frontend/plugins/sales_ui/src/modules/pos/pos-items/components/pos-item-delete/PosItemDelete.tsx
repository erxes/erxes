import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useDeletePosItems } from '~/modules/pos/pos-items/hooks/useDeletePosItems';

interface PosItemDeleteProps {
  posItemIds: string;
  onDeleteSuccess?: () => void;
}

export const PosItemDelete = ({
  posItemIds,
  onDeleteSuccess,
}: PosItemDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePosItems } = useDeletePosItems();
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
          message: `Are you sure you want to delete ${
            posItemCount === 1
              ? 'the selected POS item'
              : `the ${posItemCount} selected POS items`
          }?`,
        }).then(() => {
          removePosItems(posItemIds, {
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
                  posItemCount === 1
                    ? 'pos item deleted successfully.'
                    : 'pos items deleted successfully.'
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
