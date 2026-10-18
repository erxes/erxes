import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_FORMS_LIST } from '../graphql/formQueries';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import type { FormsQuery, FormsQueryVariables } from '~/gql/graphql';

const FORMS_PER_PAGE = 24;

export const useFormsList = (
  options?: QueryHookOptions<FormsQuery, FormsQueryVariables>,
) => {
  const { data, loading, fetchMore } = useQuery(GET_FORMS_LIST, {
    variables: {
      limit: FORMS_PER_PAGE,
      channelId: options?.variables?.channelId,
      ...options?.variables,
    },
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  const forms = data?.forms?.list ? compactList(data.forms.list) : undefined;
  const pageInfo = toCursorPageInfo(data?.forms?.pageInfo);
  const totalCount = data?.forms?.totalCount;

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
        if (!fetchMoreResult.forms || !prev.forms) return prev;

        return {
          ...prev,
          forms: mergeCursorList(direction, prev.forms, fetchMoreResult.forms),
        };
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
