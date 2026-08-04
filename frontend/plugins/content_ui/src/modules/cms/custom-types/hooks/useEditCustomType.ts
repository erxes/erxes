import { useMutation } from '@apollo/client';
import { CMS_CUSTOM_POST_TYPE_EDIT } from '../graphql/mutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useEditCustomType = (onRefetch?: () => void) => {
  const { t } = useTranslation('content');
  const [editTypeMutation, { loading, error }] = useMutation(
    CMS_CUSTOM_POST_TYPE_EDIT,
    {
      onCompleted: () => {
        toast({ title: t('success'), description: t('custom-type-updated') });
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

  return {
    editType: editTypeMutation,
    loading,
    error,
  };
};
