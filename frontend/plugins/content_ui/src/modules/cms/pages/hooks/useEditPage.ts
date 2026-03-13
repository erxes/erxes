import { useMutation } from '@apollo/client';
import { PAGES_EDIT } from '../graphql/mutations/pagesMutations';

export const useEditPage = () => {
  const [editPageMutation, { loading }] = useMutation(PAGES_EDIT);

  const editPage = ({ variables, ...options }: any) => {
    return editPageMutation({
      variables,
      refetchQueries: ['PageList'],
      ...options,
    });
  };

  return { editPage, loading };
};
