import { OperationVariables, useMutation } from '@apollo/client';
import { EDIT_BRANDS } from '../graphql';
import { useToast } from 'erxes-ui';

export function useBrandsEdit() {
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
            title: 'Brand updated successfully',
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
