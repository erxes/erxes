import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useRemovePos } from '@/pos/hooks/usePosRemove';

interface CoverDeleteProps {
  coverIds: string;
  onDeleteSuccess?: () => void;
}

export const CoverDelete = ({
  coverIds,
  onDeleteSuccess,
}: CoverDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePos } = useRemovePos();
  const { toast } = useToast();

  const coverCount = coverIds.includes(',') ? coverIds.split(',').length : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${coverCount} selected cover?`,
        }).then(() => {
          removePos(coverIds, {
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
                description: `cover deleted successfully.`,
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
