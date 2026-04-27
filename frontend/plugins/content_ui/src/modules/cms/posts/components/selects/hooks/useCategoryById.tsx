import { OperationVariables, useQuery } from '@apollo/client';
import { CMS_CATEGORY_DETAIL } from '../../../../categories/graphql/queries/categoryDetailQuery';

export const useCategoryById = (options: OperationVariables) => {
  const { data, loading } = useQuery(CMS_CATEGORY_DETAIL, {
    skip: !options.variables?.id,
    ...options,
  });
  const { cmsCategoryDetail: categoryDetail } = data || {};
  return { categoryDetail, loading };
};
