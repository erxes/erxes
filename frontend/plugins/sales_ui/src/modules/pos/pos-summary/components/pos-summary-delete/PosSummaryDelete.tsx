import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useRemovePos } from '@/pos/hooks/usePosRemove';

interface PosSummaryDeleteProps {
  posSummaryIds: string;
  onDeleteSuccess?: () => void;
}

export const PosSummaryDelete = ({
  posSummaryIds,
  onDeleteSuccess,
}: PosSummaryDeleteProps) => {
  const { confirm } = useConfirm();
  const { removePos } = useRemovePos();
  const { toast } = useToast();

  const posSummaryCount = posSummaryIds.includes(',')
    ? posSummaryIds.split(',').length
    : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${posSummaryCount} selected pos summary?`,
        }).then(() => {
          removePos(posSummaryIds, {
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
                description: `pos summary deleted successfully.`,
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
