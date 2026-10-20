import { useMutation } from '@apollo/client';
import { PAGES_REMOVE } from '../graphql/mutations/pagesMutations';

export const useRemovePage = () => {
  const [_removePage, { loading }] = useMutation(PAGES_REMOVE);

  const removePage = async (pageId: string) => {
    await _removePage({ variables: { id: pageId } });
  };

  return { removePage, loading };
};
