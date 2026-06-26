import { useMutation } from '@apollo/client';
import { PAGES_EDIT } from '../graphql/mutations/pagesMutations';

export const useBulkEditPages = () => {
  const [editPageMutation, { loading }] = useMutation(PAGES_EDIT, {
    refetchQueries: ['PageList'],
  });

  const bulkEditPages = async (
    ids: string[],
    input: Record<string, unknown>,
  ) => {
    await Promise.all(
      ids.map((_id) => editPageMutation({ variables: { _id, input } })),
    );
  };

  return { bulkEditPages, loading };
};
