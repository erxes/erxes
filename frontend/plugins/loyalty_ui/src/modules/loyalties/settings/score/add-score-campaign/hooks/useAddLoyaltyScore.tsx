import { useMutation } from '@apollo/client';
import { MutationHookOptions } from '@apollo/client';
import { LOYALTY_SCORE_ADD_MUTATION } from '../graphql/mutations/loyaltyScoreAddMutation';
import { useToast } from 'erxes-ui';

export interface AddLoyaltyScoreResult {
  createCampaign: any;
}

export interface AddLoyaltyScoreVariables {
  name: string;
  kind: string;
  description?: string;
  productCategory?: string[];
  product?: string[];
  tags?: string[];
  startDate?: string;
  endDate?: string;
  orExcludeProductCategory?: string[];
  orExcludeProduct?: string[];
  orExcludeTag?: string[];
}

export function useAddLoyaltyScore() {
  const { toast } = useToast();

  const [addLoyaltyScore, { loading, error }] = useMutation<
    AddLoyaltyScoreResult,
    AddLoyaltyScoreVariables
  >(LOYALTY_SCORE_ADD_MUTATION, {
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.createCampaign;

        if (!newCampaign) {
          return;
        }

        cache.modify({
          fields: {
            getCampaigns: (existing = {}, details: any) => {
              const { args, readField, toReference } = details;
              if (args?.kind !== 'score') {
                return existing;
              }

              const existingList = (existing as any)?.list || [];
              const totalCount = (existing as any)?.totalCount;

              const newRef = toReference(newCampaign);
              if (!newRef) {
                return existing;
              }

              const alreadyExists = existingList.some(
                (ref: any) => readField('_id', ref) === newCampaign._id,
              );

              if (alreadyExists) {
                return existing;
              }

              return {
                ...(existing as any),
                list: [newRef, ...existingList],
                totalCount:
                  typeof totalCount === 'number' ? totalCount + 1 : totalCount,
              };
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const loyaltyScoreAdd = async (
    options: MutationHookOptions<
      AddLoyaltyScoreResult,
      AddLoyaltyScoreVariables
    >,
  ) => {
    return addLoyaltyScore({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Score campaign created successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { loyaltyScoreAdd, loading, error };
}
