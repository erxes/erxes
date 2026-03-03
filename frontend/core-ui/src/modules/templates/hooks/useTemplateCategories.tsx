import { QUERY_TEMPLATE_CATEGORIES } from '@/templates/graphql/queries';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { TemplateCategory } from '../types/TemplateCategory';

export const useTemplateCategoryVariables = () => {
  const [{ contentType }] = useMultiQueryState<{
    contentType: string;
  }>(['contentType']);

  return {
    type: contentType || undefined,
  };
};

export const useTemplateCategories = (options: QueryHookOptions<ICursorListResponse<TemplateCategory>>) => {
  const variables = useTemplateCategoryVariables();

  const { data, loading, error, fetchMore } = useQuery<ICursorListResponse<TemplateCategory>>(
    QUERY_TEMPLATE_CATEGORIES,
    {
      ...options,
      variables: { ...variables, ...options.variables },
    },
  );

  const {
    list: categories,
    pageInfo,
    totalCount,
  } = data?.templateCategories || {};

  const handleFetchMore = () => {
    if (!validateFetchMore({ direction: EnumCursorDirection.FORWARD, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        direction: EnumCursorDirection.FORWARD,
        cursor: pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          templateCategories: mergeCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.templateCategories,
            prevResult: prev.templateCategories,
          }),
        });
      },
    });
  };

  return {
    categories,
    pageInfo,
    loading,
    error,
    totalCount,
    handleFetchMore,
  };
};
