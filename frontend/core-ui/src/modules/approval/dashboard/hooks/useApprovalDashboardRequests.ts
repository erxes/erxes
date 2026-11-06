import {
  APPROVAL_DASHBOARD_LIMIT,
  TApprovalRequestsConfig,
} from '@/approval/dashboard/approvalDashboardConfig';
import { SETTINGS_APPROVAL_REQUESTS } from '@/settings/approval/graphql/approvalRequests';
import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { ApprovalRequest, currentUserState } from 'ui-modules';

type ApprovalDashboardRequestsResponse = {
  approvalRequests: { list: ApprovalRequest[]; totalCount: number };
};

/** The newest requests waiting on me, or the ones I sent. */
export const useApprovalDashboardRequests = ({
  scope,
}: TApprovalRequestsConfig) => {
  const currentUser = useAtomValue(currentUserState);
  const userId = currentUser?._id || '';

  const { data, loading, error, refetch } =
    useQuery<ApprovalDashboardRequestsResponse>(SETTINGS_APPROVAL_REQUESTS, {
      variables: {
        limit: APPROVAL_DASHBOARD_LIMIT,
        orderBy: { createdAt: -1 },
        ...(scope === 'toDecide'
          ? { status: 'pending', approverIds: [userId] }
          : { requesterIds: [userId] }),
      },
      skip: !userId,
      fetchPolicy: 'cache-and-network',
    });

  const { list = [], totalCount = 0 } = data?.approvalRequests || {};

  return { list, totalCount, loading, error, refetch, userId };
};
