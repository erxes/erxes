import { useMutation, MutationHookOptions } from '@apollo/client';
import { UPDATE_CYCLE } from '../graphql/mutations/updateCycle';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export const useUpdateCycle = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [_updateCycle, { loading, error }] = useMutation(UPDATE_CYCLE);

  const updateCycle = (
    options: MutationHookOptions & { showSuccessToast?: boolean },
  ) => {
    return _updateCycle({
      ...options,
      variables: {
        input: options.variables,
      },
      update: (cache, { data }) => {
        if (data?.updateCycle) {
          const updatedCycle = data.updateCycle;
          const cacheId = cache.identify(updatedCycle);

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
        console.error('Update cycle error:', error);
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
