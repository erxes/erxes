import { QUERY_TEMPLATE_TYPES } from '@/templates/graphql/queries';
import { TemplateType } from '@/templates/types/Template';
import { useQuery } from '@apollo/client';

interface TemplateTypesResponse {
  templatesGetTypes: Array<TemplateType>;
}

export const useTemplateTypes = () => {
  const { data, loading, error } =
    useQuery<TemplateTypesResponse>(QUERY_TEMPLATE_TYPES);

  return {
    templateTypes: data?.templatesGetTypes || [],
    loading,
    error,
  };
};
