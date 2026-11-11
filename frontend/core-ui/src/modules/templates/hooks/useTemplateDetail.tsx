import { QUERY_TEMPLATE_DETAIL } from '@/templates/graphql/queries';
import { Template } from '@/templates/types/Template';
import { useQuery } from '@apollo/client';

export type TemplateDetail = Pick<
  Template,
  '_id' | 'name' | 'description' | 'categoryIds'
>;

export const useTemplateDetail = (templateId?: string) => {
  const { data, loading, error } = useQuery<{
    templateDetail: TemplateDetail;
  }>(QUERY_TEMPLATE_DETAIL, {
    variables: { _id: templateId },
    skip: !templateId,
  });

  return {
    templateDetail: data?.templateDetail,
    loading,
    error,
  };
};
