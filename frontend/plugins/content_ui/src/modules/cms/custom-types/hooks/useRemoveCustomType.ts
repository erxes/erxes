import { useMutation } from '@apollo/client';
import { CMS_CUSTOM_POST_TYPE_REMOVE } from '../graphql/mutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useRemoveCustomType = (onRefetch?: () => void) => {
  const { t } = useTranslation('content');
  const [removeTypeMutation, { loading, error }] = useMutation(
    CMS_CUSTOM_POST_TYPE_REMOVE,
    {
      onCompleted: () => {
        toast({ title: t('success'), description: t('custom-type-deleted') });
        onRefetch?.();
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  const removeType = async (id: string) => {
    await removeTypeMutation({ variables: { _id: id } });
  };

  const removeBulkTypes = async (ids: string[]) => {
    for (const id of ids) {
      await removeTypeMutation({ variables: { _id: id } });
    }
  };

  return {
    removeType,
    removeBulkTypes,
    loading,
    error,
  };
};
