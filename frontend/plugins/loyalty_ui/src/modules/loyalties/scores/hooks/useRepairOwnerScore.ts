import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_SCORE_REPAIR_OWNER_MUTATION } from '../graphql/mutations';

export interface RepairOwnerScoreVariables {
  ownerId: string;
  ownerType: string;
}

export const useRepairOwnerScore = (
  refetchQueries: string[] = ['ScoreLogStatistics', 'ScoreLogs'],
) => {
  const { t } = useTranslation('loyalty');
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
          title: t('success'),
          description: t('score-repaired'),
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { repairOwnerScore, loading, error };
};
