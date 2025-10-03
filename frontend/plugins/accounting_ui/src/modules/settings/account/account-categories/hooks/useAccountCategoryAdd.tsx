import { useMutation } from '@apollo/client';
import { ACCOUNT_CATEGORIES_ADD } from '../graphql/mutations/accountsCategory';

export const useAccountCategoryAdd = () => {
  const [addAccountCategory, { loading }] = useMutation(
    ACCOUNT_CATEGORIES_ADD,
    {
      refetchQueries: ['accountCategories'],
    },
  );

  return { addAccountCategory, loading };
};
