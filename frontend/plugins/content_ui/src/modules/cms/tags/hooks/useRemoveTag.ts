import { useMutation } from '@apollo/client';
import { CMS_TAGS_REMOVE } from '../graphql/mutations';

export const useRemoveTag = () => {
  const [removeTagMutation, { loading, error }] = useMutation(CMS_TAGS_REMOVE, {
    refetchQueries: ['CmsTags'],
  });

  const removeTag = async (tagIds: string[]) => {
    try {
      const response = await removeTagMutation({
        variables: {
          tagIds,
        },
      });
      return response.data;
    } catch (e: any) {
      console.error(e.message);
      throw e;
    }
  };

  return {
    removeTag,
    loading,
    error,
  };
};
