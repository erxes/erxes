import { useMutation } from '@apollo/client';
import { CMS_TAGS_ADD } from '../graphql/mutations';
import { TagFormData } from '../types/tagTypes';

export const useAddTag = () => {
  const [addTagMutation, { loading, error }] = useMutation(CMS_TAGS_ADD, {
    refetchQueries: ['CmsTags'],
  });

  const addTag = async (input: TagFormData) => {
    try {
      const response = await addTagMutation({
        variables: {
          input,
        },
      });
      return response.data;
    } catch (e: any) {
      console.error(e.message);
      throw e;
    }
  };

  return {
    addTag,
    loading,
    error,
  };
};
