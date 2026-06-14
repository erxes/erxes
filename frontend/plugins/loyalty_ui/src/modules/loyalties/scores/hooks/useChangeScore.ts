import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { CHANGE_SCORE_MUTATION } from '../graphql/mutations';

export interface ChangeScoreVariables {
  ownerType: string;
  ownerId: string;
  campaignId?: string;
  targetId?: string;
  action: string;
  change: number;
  description?: string;
  serviceName?: string;
}

export const useChangeScore = (
  refetchQueries: string[] = ['ScoreLogs', 'ScoreLogStatistics'],
) => {
  const { toast } = useToast();

  const [changeScoreMutation, { loading, error }] = useMutation(
    CHANGE_SCORE_MUTATION,
    { refetchQueries },
  );

  const changeScore = async (variables: ChangeScoreVariables) => {
    return changeScoreMutation({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Score given successfully',
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

  return { changeScore, loading, error };
};
