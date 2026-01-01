import { useQuery } from '@apollo/client';
import { TAGS_TYPES } from 'ui-modules/modules/tags-new/graphql/tagTypeQuery';

interface IUseGetTagsTypes {
  tagsGetTypes: {
    description: string;
    contentType: string;
  }[];
}

export const useGetTagsTypes = () => {
  const { data, error, loading } = useQuery<IUseGetTagsTypes>(TAGS_TYPES);
  return {
    types: data?.tagsGetTypes || [],
    loading,
    error,
  };
};
