import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { LOYALTY_SCORE_REPAIR_OWNER_MUTATION } from '../graphql/mutations';

export interface RepairOwnerScoreVariables {
  ownerId: string;
  ownerType: string;
}

export const useRepairOwnerScore = (
  refetchQueries: string[] = ['ScoreLogStatistics', 'ScoreLogs'],
) => {
  const { toast } = useToast();

  const [repairOwnerScoreMutation, { loading, error }] = useMutation(
    LOYALTY_SCORE_REPAIR_OWNER_MUTATION,
    { refetchQueries },
  );

  const repairOwnerScore = async (variables: RepairOwnerScoreVariables) => {
    return repairOwnerScoreMutation({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Score repaired successfully',
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { repairOwnerScore, loading, error };
};
