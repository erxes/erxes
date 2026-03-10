import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_FORMS_LIST } from '../graphql/formQueries';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';

const FORMS_PER_PAGE = 24;

export const useFormsList = (options?: QueryHookOptions) => {
  const { data, loading, fetchMore } = useQuery(GET_FORMS_LIST, {
    variables: {
      limit: FORMS_PER_PAGE,
      channelId: options?.variables?.channelId,
      ...options?.variables,
    },
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  const { list: forms, totalCount, pageInfo } = data?.forms || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;
    fetchMore({
      variables: {
        cursor: pageInfo?.endCursor,
        limit: FORMS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          forms: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.forms,
            prevResult: prev.forms,
          }),
        });
      },
    });
  };

  return {
    forms,
    loading,
    handleFetchMore,
    totalCount,
    pageInfo,
  };
};
