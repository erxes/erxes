import { QUERY_TEMPLATES } from '@/templates/graphql/queries';
import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';

export const useTemplatesVariables = () => {
  const [
    {
      searchValue,
      contentType,
      categoryIds,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
    },
  ] = useMultiQueryState<{
    contentType: string;
    searchValue: string;
    createdAt: string;
    createdBy: string;
    categoryIds: string[];
    updatedAt: string;
    updatedBy: string;
  }>([
    'contentType',
    'searchValue',
    'createdAt',
    'createdBy',
    'categoryIds',
    'updatedAt',
    'updatedBy',
  ]);

  const variables: Record<string, any> = {};
  const dateFilters: Record<string, any> = {};

  if (contentType) {
    variables['contentType'] = contentType;
  }

  if (searchValue) {
    variables['searchValue'] = searchValue;
  }

  if (categoryIds?.length) {
    variables['categoryIds'] = categoryIds;
  }

  if (createdBy) {
    variables['createdBy'] = createdBy;
  }

  if (updatedBy) {
    variables['updatedBy'] = updatedBy;
  }

  if (createdAt) {
    dateFilters.createdAt = {
      gte: parseDateRangeFromString(createdAt)?.from,
      lte: parseDateRangeFromString(createdAt)?.to,
    };
  }

  if (updatedAt) {
    dateFilters.updatedAt = {
      gte: parseDateRangeFromString(updatedAt)?.from,
      lte: parseDateRangeFromString(updatedAt)?.to,
    };
  }

  if (dateFilters.createdAt || dateFilters.updatedAt) {
    variables['dateFilters'] = JSON.stringify(dateFilters);
  }

  return variables;
};

export const useTemplates = () => {
  const variables = useTemplatesVariables();

  const { data, loading, fetchMore } = useQuery(QUERY_TEMPLATES, {
    variables,
  });

  const { list: templates, pageInfo } = data?.templateList || {};

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
          templateList: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.templateList,
            prevResult: prev.templateList,
          }),
        });
      },
    });
  };

  return {
    templates,
    pageInfo,
    loading,
    handleFetchMore,
  };
};
