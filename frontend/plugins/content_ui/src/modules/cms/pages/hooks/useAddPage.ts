import { useMutation } from '@apollo/client';
import { PAGES_ADD } from '../graphql/mutations/pagesMutations';

export const useAddPage = () => {
  const [addPageMutation, { loading }] = useMutation(PAGES_ADD);

  const addPage = ({ variables, ...options }: any) => {
    return addPageMutation({
      variables,
      refetchQueries: ['PageList', 'PageDetail', 'cmsTranslations'],
      ...options,
    });
  };

  return { addPage, loading };
};
