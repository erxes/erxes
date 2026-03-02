import { useQuery } from '@apollo/client';
import { QUERY_TEMPLATE_TYPES } from '../graphql/queries';

export const useTemplateTypes = () => {
  const { data, loading, error } = useQuery(QUERY_TEMPLATE_TYPES);

  return {
    templateTypes: data?.templatesGetTypes || [],
    loading,
    error,
  };
};
