import { useMutation } from '@apollo/client';
import { CMS_TAGS_EDIT } from '../graphql/mutations';
import { TagFormData } from '../types/tagTypes';

export const useEditTag = () => {
  const [editTagMutation, { loading, error }] = useMutation(CMS_TAGS_EDIT, {
    refetchQueries: ['CmsTags'],
  });

  const editTag = async (_id: string, input: TagFormData) => {
    try {
      const response = await editTagMutation({
        variables: {
          _id,
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
    editTag,
    loading,
    error,
  };
};
