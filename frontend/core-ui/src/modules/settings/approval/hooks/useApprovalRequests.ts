import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useEffect } from 'react';
import { ApprovalRequest, ApprovalRequestStatus, IPageInfo } from 'ui-modules';
import { SETTINGS_APPROVAL_REQUESTS } from '../graphql/approvalRequests';

const APPROVAL_REQUESTS_PER_PAGE = 20;

export const APPROVAL_REQUESTS_CURSOR_SESSION_KEY =
  'settings-approval-requests-cursor';

export type ApprovalRequestStatusFilter = ApprovalRequestStatus | 'all';

type ApprovalRequestsQueryResponse = {
  approvalRequests: {
    list: ApprovalRequest[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
};

type UseApprovalRequestsInput = {
  status?: ApprovalRequestStatusFilter;
};

export const useApprovalRequests = ({
  status = 'all',
}: UseApprovalRequestsInput = {}) => {
  const { cursor, setCursor } = useRecordTableCursor({
    sessionKey: APPROVAL_REQUESTS_CURSOR_SESSION_KEY,
  });

  useEffect(() => {
    setCursor('');
  }, [setCursor, status]);

  const statusVariable = status === 'all' ? undefined : status;
  const { data, loading, error, fetchMore, refetch } =
    useQuery<ApprovalRequestsQueryResponse>(SETTINGS_APPROVAL_REQUESTS, {
      variables: {
        cursor: cursor || undefined,
        limit: APPROVAL_REQUESTS_PER_PAGE,
        status: statusVariable,
        orderBy: { createdAt: -1 },
      },
      notifyOnNetworkStatusChange: true,
    });

  const { list = [], totalCount = 0, pageInfo } = data?.approvalRequests || {};

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
        limit: APPROVAL_REQUESTS_PER_PAGE,
        direction,
        status: statusVariable,
        orderBy: { createdAt: -1 },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return Object.assign({}, prev, {
          approvalRequests: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.approvalRequests,
            prevResult: prev.approvalRequests,
          }),
        });
      },
    });
  };

  return {
    list,
    totalCount,
    loading,
    error,
    pageInfo,
    hasNextPage: pageInfo?.hasNextPage,
    hasPreviousPage: pageInfo?.hasPreviousPage,
    handleFetchMore,
    refetch,
  };
};
