import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SAFE_REMAINDER_ITEMS_BULK_EDIT } from '../graphql/safeRemainderChange';

export const useSafeRemainderItemsBulkEdit = () => {
  const [bulkEdit, { loading }] = useMutation(SAFE_REMAINDER_ITEMS_BULK_EDIT);

  const bulkEditRemItems = (
    safeRemainderId: string,
    productsData: { productCode: string; count: number }[],
    duplicateRule: 'skip' | 'last' | 'add' = 'last',
  ) => {
    return bulkEdit({
      variables: { safeRemainderId, productsData, duplicateRule },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: `${data.safeRemainderItemsBulkEdit} item(s) updated`,
          variant: 'success',
        });
      },
      refetchQueries: ['SafeRemainderItems'],
    });
  };

  return { bulkEditRemItems, loading };
};
