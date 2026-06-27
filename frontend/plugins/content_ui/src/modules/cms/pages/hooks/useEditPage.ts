import { useMutation } from '@apollo/client';
import { PAGES_EDIT } from '@/cms/pages/graphql';

export const useEditPage = () => {
  const [editPageMutation, { loading }] = useMutation(PAGES_EDIT);

  const editPage = ({ variables, ...options }: any) => {
    return editPageMutation({
      variables,
      refetchQueries: ['PageList', 'PageDetail', 'cmsTranslations'],
      ...options,
    });
  };

  return { editPage, loading };
};
