import { useMutation, MutationHookOptions } from '@apollo/client';
import { UPDATE_CYCLE } from '../graphql/mutations/updateCycle';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  CycleInput,
  UpdateCycleMutation,
  UpdateCycleMutationVariables,
} from '~/gql/graphql';

type UpdateCycleOptions = Omit<
  MutationHookOptions<UpdateCycleMutation, UpdateCycleMutationVariables>,
  'variables'
> & {
  variables?: CycleInput;
  showSuccessToast?: boolean;
};

export const useUpdateCycle = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [_updateCycle, { loading, error }] = useMutation(UPDATE_CYCLE);

  const updateCycle = (options: UpdateCycleOptions) => {
    return _updateCycle({
      ...options,
      variables: options.variables ? { input: options.variables } : undefined,
      update: (cache, { data }) => {
        if (data?.updateCycle) {
          const updatedCycle = data.updateCycle;
          const cacheId = cache.identify({
            __typename: 'Cycle',
            _id: updatedCycle._id,
          });

          if (cacheId) {
            cache.modify({
              id: cacheId,
              fields: {
                name: () => updatedCycle.name,
                description: () => updatedCycle.description,
                startDate: () => updatedCycle.startDate,
                endDate: () => updatedCycle.endDate,
                isCompleted: () => updatedCycle.isCompleted,
                isActive: () => updatedCycle.isActive,
                statistics: () => updatedCycle.statistics,
                donePercent: () => updatedCycle.donePercent,
                unFinishedTasks: () => updatedCycle.unFinishedTasks,
              },
            });
          }
        }
      },
      onCompleted: (data) => {
        if (data?.updateCycle && options.showSuccessToast) {
          toast({
            title: t('success'),
            description: t('cycle-updated-successfully'),
            variant: 'default',
          });
        }
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message || t('failed-to-update-cycle'),
          variant: 'destructive',
        });
      },
    });
  };

  return { updateCycle, loading, error };
};
