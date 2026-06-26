import { useMutation } from '@apollo/client';
import { CMS_TAGS_EDIT } from '../graphql/mutations';

export const useBulkEditTags = () => {
  const [editTagMutation, { loading }] = useMutation(CMS_TAGS_EDIT, {
    refetchQueries: ['CmsTags'],
  });

  const bulkEditTags = async (
    ids: string[],
    input: Record<string, unknown>,
  ) => {
    await Promise.all(
      ids.map((_id) => editTagMutation({ variables: { _id, input } })),
    );
  };

  return { bulkEditTags, loading };
};
