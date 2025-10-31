import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveByDate } from '@/by-date/detail/hooks/useRemoveByDate';

export const ByDateDelete = ({ byDateIds }: { byDateIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeByDate } = useRemoveByDate();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            byDateIds.length
          } selected by date${byDateIds.length === 1 ? '' : 's'}?`,
        }).then(() => {
          removeByDate(byDateIds, {
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
