import { useQuery } from '@apollo/client';
import { QUERY_TEMPLATE_CATEGORY } from 'ui-modules/modules/templates/graphql/queries';
import { TemplateCategory } from 'ui-modules/modules/templates/types';

export const useTemplateCategoryDetail = (categoryId?: string) => {
  const { data, loading, error } = useQuery<{
    templateCategory: TemplateCategory;
  }>(QUERY_TEMPLATE_CATEGORY, {
    variables: { _id: categoryId },
    skip: !categoryId,
  });

  return {
    categoryDetail: data?.templateCategory,
    loading,
    error,
  };
};
