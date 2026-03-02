import { QUERY_TEMPLATE_TYPES } from '@/templates/graphql/queries';
import { useQuery } from '@apollo/client';

export const useTemplateTypes = () => {
  const { data, loading, error } = useQuery(QUERY_TEMPLATE_TYPES);

  return {
    templateTypes: data?.templatesGetTypes || [],
    loading,
    error,
  };
};
