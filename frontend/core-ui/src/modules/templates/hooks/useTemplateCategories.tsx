import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { QUERY_TEMPLATE_CATEGORIES } from '../graphql/queries';

export const useTemplateCategoryVariables = () => {
  const [{ contentType }] = useMultiQueryState<{
    contentType: string;
  }>(['contentType']);

  return {
    type: contentType || undefined,
  };
};

export const useTemplateCategories = () => {
  const variables = useTemplateCategoryVariables();

  const { data, loading, fetchMore } = useQuery(QUERY_TEMPLATE_CATEGORIES, {
    variables,
  });

  const { list: categories, pageInfo } = data?.templateCategories || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: 20,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          templateCategories: mergeCursorData({
            direction,
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
    handleFetchMore,
  };
};
