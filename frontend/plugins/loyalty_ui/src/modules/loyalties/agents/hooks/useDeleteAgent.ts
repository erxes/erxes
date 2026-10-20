import { Reference, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DELETE_AGENT_MUTATION } from '../graphql/mutations/mutations';

export const useDeleteAgent = () => {
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

  const [deleteAgent, { loading, error }] = useMutation(DELETE_AGENT_MUTATION);

  const handleDeleteAgent = async (_id: string) => {
    return deleteAgent({
      variables: { _id },
      update(cache) {
        cache.modify({
          fields: {
            agentsMain(existing = {}, { readField }) {
              const list: Reference[] = existing.list || [];

              return {
                ...existing,
                list: list.filter((ref) => readField('_id', ref) !== _id),
                totalCount: Math.max((existing.totalCount || 0) - 1, 0),
              };
            },
          },
        });
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('agent-deleted'),
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

  return { deleteAgent: handleDeleteAgent, loading, error };
};
