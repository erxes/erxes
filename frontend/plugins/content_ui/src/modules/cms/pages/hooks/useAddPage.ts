import { useMutation } from '@apollo/client';
import { PAGES_ADD } from '../graphql/mutations/pagesMutations';
import { PAGE_LIST } from '../graphql/queries/pagesListQueries';

export const useAddPage = () => {
  const [addPageMutation, { loading }] = useMutation(PAGES_ADD);

  const addPage = ({ variables, ...options }: any) => {
    return addPageMutation({
      variables,
      refetchQueries: ['PageList'],
      ...options,
    });
  };

  return { addPage, loading };
};
