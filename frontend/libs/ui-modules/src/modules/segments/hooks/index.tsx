import { DocumentNode, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useQueryState,
  useRecordTableCursor,
} from 'erxes-ui';
import { PROPERTIES_WITH_FIELDS } from '../graphql/queries';
import { FieldQueryResponse } from '../types';

export const getFieldsProperties = (propertyType?: string) => {
  const [contentType] = useQueryState<string>('contentType');

  const { data, loading } = useQuery<FieldQueryResponse>(
    PROPERTIES_WITH_FIELDS,
    {
      variables: { contentType: propertyType || contentType },
      skip: !contentType && !propertyType,
    },
  );

  const { fieldsCombinedByContentType = [], segmentsGetAssociationTypes = [] } =
    data || {};

  return {
    fields: fieldsCombinedByContentType,
    propertyTypes: segmentsGetAssociationTypes,
    loading,
  };
};

export const useQuerySelectInputList = (
  query: DocumentNode,
  queryName: string,
  searchValue: string,
  skip?: boolean,
) => {
  const PER_PAGE = 30;
  const { cursor } = useRecordTableCursor({
    sessionKey: 'property_cursor',
  });
  const { data, loading, fetchMore } = useQuery(query, {
    variables: {
      limit: PER_PAGE,
      cursor,
      searchValue: searchValue ?? undefined,
    },
    skip,
  });

  const { list, totalCount, pageInfo } = (data || {})[queryName] || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
    onFetchMoreCompleted?: (fetchMoreResult: {
      [queryName: string]: {
        list: any[];
      };
    }) => void;
  }) => {
    if (
      (direction === 'forward' && pageInfo?.hasNextPage) ||
      (direction === 'backward' && pageInfo?.hasPreviousPage)
    ) {
      return fetchMore({
        variables: {
          cursor:
            direction === 'forward'
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: PER_PAGE,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }

          const { pageInfo: fetchMorePageInfo, list: fetchMoreList = [] } =
            (fetchMoreResult || {})[queryName];

          const { pageInfo: prevPageInfo, list: prevList = [] } =
            (prev || {})[queryName] || {};

          // setCursor(prevPageInfo?.endCursor);

          return Object.assign({}, prev, {
            [queryName]: mergeCursorData({
              direction: EnumCursorDirection.FORWARD,
              fetchMoreResult: {
                pageInfo: fetchMorePageInfo,
                list: fetchMoreList,
              },
              prevResult: {
                pageInfo: prevPageInfo,
                list: prevList,
              },
            }),
          });
        },
      });
    }
  };

  return {
    list,
    loading,
    totalCount,
    handleFetchMore,
  };
};
