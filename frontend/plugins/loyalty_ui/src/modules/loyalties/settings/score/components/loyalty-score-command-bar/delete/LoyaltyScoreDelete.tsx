import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useLoyaltyScoreRowsRemove } from '../../../hooks/useLoyaltyScoreRowsRemove';

interface LoyaltyScoreDeleteProps {
  loyaltyScoreIds: string;
  onDeleteSuccess?: () => void;
}

export const LoyaltyScoreDelete = ({
  loyaltyScoreIds,
  onDeleteSuccess,
}: LoyaltyScoreDeleteProps) => {
  const { confirm } = useConfirm();
  const { removeLoyaltyScoreRows } = useLoyaltyScoreRowsRemove();
  const { toast } = useToast();

  const scoreCount = loyaltyScoreIds.includes(',')
    ? loyaltyScoreIds.split(',').length
    : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${scoreCount} selected loyalty score campaigns?`,
        }).then(() => {
          removeLoyaltyScoreRows({
            variables: { _ids: loyaltyScoreIds.split(',') },
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
                description: `${scoreCount} ${
                  scoreCount === 1
                    ? 'loyalty score campaign'
                    : 'loyalty score campaigns'
                } deleted successfully.`,
                variant: 'success',
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
