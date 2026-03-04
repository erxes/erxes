import { MutationHookOptions, useMutation } from '@apollo/client';
import { CMS_CATEGORIES_ADD } from '../../../../categories/graphql/mutations/categoriesAddMutation';

export const useCategoriesAdd = () => {
  const [categoriesAdd, { loading }] = useMutation(CMS_CATEGORIES_ADD);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    categoriesAdd({
      ...options,
      variables: {
        input: variables,
      },
      refetchQueries: ['CmsCategoriesMain'],
    });
  };

  return { categoriesAdd: mutate, loading };
};
