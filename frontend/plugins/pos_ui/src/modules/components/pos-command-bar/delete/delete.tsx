import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useRemovePos } from '@/hooks/usePosRemove';

interface PosDeleteProps {
  posIds: string;
  onDeleteSuccess?: () => void;
}

export const PosDelete = ({ posIds, onDeleteSuccess }: PosDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePos } = useRemovePos();
  const { toast } = useToast();

  const posCount = posIds.includes(',') ? posIds.split(',').length : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${posCount} selected pos?`,
        }).then(() => {
          removePos(posIds, {
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
                description: `pos deleted successfully.`,
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
