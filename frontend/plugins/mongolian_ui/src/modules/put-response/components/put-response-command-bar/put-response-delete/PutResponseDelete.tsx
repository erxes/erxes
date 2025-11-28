import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemovePutResponse } from '@/put-response/detail/hooks/useRemovePutResponse';

export const PutResponseDelete = ({ productIds }: { productIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removePutResponse } = useRemovePutResponse();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            productIds.length
          } selected put response${productIds.length === 1 ? '' : 's'}?`,
        }).then(() => {
          removePutResponse(productIds, {
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
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
