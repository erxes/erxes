import { OperationVariables, useMutation } from '@apollo/client';
import { EDIT_BRANDS } from '../graphql';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function useBrandsEdit() {
  const { t } = useTranslation('settings');
  const [_brandsEdit, { loading, error }] = useMutation(EDIT_BRANDS);
  const { toast } = useToast();

  const handleEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _brandsEdit({
      ...operationVariables,
      variables,
      update: (cache, { data: { brandsEdit } }) => {
        cache.modify({
          id: cache.identify(brandsEdit),
          fields: fieldsToUpdate,
        });
      },
      onCompleted(data) {
        if (data.brandsEdit) {
          toast({
            title: t('brands.updated-successfully', 'Brand updated successfully'),
            variant: 'success',
          });
        }
      },
      onError(error) {
        toast({
          title: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    handleEdit,
    loading,
    error,
  };
}
