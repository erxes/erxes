import { MutationFunctionOptions, useMutation } from '@apollo/client';
import type {
  PagesAddMutation,
  PagesAddMutationVariables,
} from '~/gql/graphql';
import { PAGES_ADD } from '../graphql/mutations/pagesMutations';

export const useAddPage = () => {
  const [addPageMutation, { loading }] = useMutation(PAGES_ADD);

  const addPage = ({
    variables,
    ...options
  }: MutationFunctionOptions<PagesAddMutation, PagesAddMutationVariables>) => {
    return addPageMutation({
      variables,
      refetchQueries: ['PageList'],
      ...options,
    });
  };

  return { addPage, loading };
};
