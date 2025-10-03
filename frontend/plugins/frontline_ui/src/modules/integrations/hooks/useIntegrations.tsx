import { useQuery, QueryHookOptions } from '@apollo/client';
import {
  GET_INTEGRATIONS_BY_KIND,
  INTEGRATION_INLINE,
} from '@/integrations/graphql/queries/getIntegrations';
import { IIntegration } from '@/integrations/types/Integration';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';

export const INTEGRATIONS_PER_PAGE = 30;

export const useIntegrations = (
  options?: QueryHookOptions<ICursorListResponse<IIntegration>>,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IIntegration>
  >(GET_INTEGRATIONS_BY_KIND, options);

  const { list: integrations, totalCount, pageInfo } = data?.integrations || {};

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
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          integrations: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.integrations,
            prevResult: prev.integrations,
          }),
        });
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
  options?: QueryHookOptions<{ integrationDetail: IIntegration }>,
) => {
  const { data, loading } = useQuery<{
    integrationDetail: IIntegration;
  }>(INTEGRATION_INLINE, options);

  return {
    integration: data?.integrationDetail,
    loading,
  };
};
