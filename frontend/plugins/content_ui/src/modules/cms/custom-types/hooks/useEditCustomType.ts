import { useMutation } from '@apollo/client';
import { CMS_CUSTOM_POST_TYPE_EDIT } from '../graphql/mutations';
import { toast } from 'erxes-ui';

export const useEditCustomType = (onRefetch?: () => void) => {
  const [editTypeMutation, { loading, error }] = useMutation(
    CMS_CUSTOM_POST_TYPE_EDIT,
    {
      onCompleted: () => {
        toast({ title: 'Success', description: 'Custom type updated!' });
        onRefetch?.();
      },
      onError: (error) => {
        toast({
          title: 'Error',
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
