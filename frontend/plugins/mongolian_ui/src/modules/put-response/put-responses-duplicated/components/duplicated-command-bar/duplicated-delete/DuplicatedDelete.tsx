import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveDuplicated } from '@/put-response/put-responses-duplicated/detail/hooks/useRemoveDuplicated';

export const DuplicatedDelete = ({
  duplicatedIds,
}: {
  duplicatedIds: string[];
}) => {
  const { confirm } = useConfirm();
  const { removeDuplicated } = useRemoveDuplicated();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            duplicatedIds.length
          } selected duplicated${duplicatedIds.length === 1 ? '' : 's'}?`,
        }).then(() => {
          removeDuplicated(duplicatedIds, {
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
