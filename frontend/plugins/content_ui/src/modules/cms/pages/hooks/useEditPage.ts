import { MutationFunctionOptions, useMutation } from '@apollo/client';
import type {
  PagesEditMutation,
  PagesEditMutationVariables,
} from '~/gql/graphql';
import { PAGES_EDIT } from '../graphql/mutations/pagesMutations';

export const useEditPage = () => {
  const [editPageMutation, { loading }] = useMutation(PAGES_EDIT);

  const editPage = ({
    variables,
    ...options
  }: MutationFunctionOptions<
    PagesEditMutation,
    PagesEditMutationVariables
  >) => {
    return editPageMutation({
      variables,
      refetchQueries: ['PageList', 'PageDetail', 'cmsTranslations'],
      ...options,
    });
  };

  return { editPage, loading };
};
