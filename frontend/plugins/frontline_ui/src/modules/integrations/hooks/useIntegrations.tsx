import { useQuery, QueryHookOptions } from '@apollo/client';
import {
  GET_INTEGRATIONS_BY_KIND,
  INTEGRATION_INLINE,
} from '@/integrations/graphql/queries/getIntegrations';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import type {
  IntegrationInlineQuery,
  IntegrationInlineQueryVariables,
  IntegrationsQuery,
  IntegrationsQueryVariables,
} from '~/gql/graphql';

export const INTEGRATIONS_PER_PAGE = 30;

export const useIntegrations = (
  options?: QueryHookOptions<IntegrationsQuery, IntegrationsQueryVariables>,
) => {
  const { data, loading, error, fetchMore } = useQuery(
    GET_INTEGRATIONS_BY_KIND,
    options,
  );

  const integrations = data?.integrations?.list
    ? compactList(data.integrations.list)
    : undefined;
  const pageInfo = toCursorPageInfo(data?.integrations?.pageInfo);
  const totalCount = data?.integrations?.totalCount;

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor: pageInfo?.endCursor,
        limit: INTEGRATIONS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.integrations || !prev.integrations) return prev;

        return {
          ...prev,
          integrations: mergeCursorList(
            direction,
            prev.integrations,
            fetchMoreResult.integrations,
          ),
        };
      },
    });
  };

  return {
    integrations,
    loading,
    pageInfo,
    totalCount,
    error,
    handleFetchMore,
  };
};

export const useIntegrationInline = (
  options?: QueryHookOptions<
    IntegrationInlineQuery,
    IntegrationInlineQueryVariables
  >,
) => {
  const { data, loading } = useQuery(INTEGRATION_INLINE, options);

  return {
    integration: data?.integrationDetail,
    loading,
  };
};
