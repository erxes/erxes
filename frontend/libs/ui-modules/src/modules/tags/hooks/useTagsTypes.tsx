import { useQuery } from '@apollo/client';
import { TAGS_TYPES } from '../graphql/queries/tagsQueries';

export const useTagsTypes = () => {
  const { data, error, loading } = useQuery(TAGS_TYPES);
  return {
    types: data?.tagsGetTypes || [],
    loading,
    error,
  };
};
