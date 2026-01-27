import { useQuery } from '@apollo/client';
import { TAGS_TYPES } from 'ui-modules/modules/tags-new/graphql/tagTypeQuery';

interface IUseTagTypes {
  tagsGetTypes: Record<
    string,
    {
      description: string;
      contentType: string;
    }[]
  >;
}

export const useTagTypes = () => {
  const { data, error, loading } = useQuery<IUseTagTypes>(TAGS_TYPES);
  return {
    types: data?.tagsGetTypes || {},
    loading,
    error,
  };
};
