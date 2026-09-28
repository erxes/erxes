import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  APPROVAL_REQUESTS,
  ApprovalRequest,
  useApprovalLockActions,
} from 'ui-modules';

// `<plugin>:<what>` — the prefix is what routes the approved change to core.
export const AUTOMATION_OWNERSHIP_CHANGE_TYPE =
  'core:automations.ownershipTransfer';

/**
 * Handing an automation over is an approval, not a setting: the request is
 * made here and the change only happens when the other person approves it.
 */
export const useAutomationOwnershipRequest = (automationId?: string) => {
  const variables = {
    contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
    contentId: automationId,
    kind: 'change',
    status: 'pending',
  };

  const { data, loading, refetch } = useQuery<{
    approvalRequests: { list: ApprovalRequest[] };
  }>(APPROVAL_REQUESTS, { variables, skip: !automationId });

  const { createRequest, loading: submitting } = useApprovalLockActions();

  const pending = (data?.approvalRequests?.list || []).find(
    (request) =>
      request.change?.changeType === AUTOMATION_OWNERSHIP_CHANGE_TYPE,
  );

  const offerOwnership = async (toUserId: string, summary: string) => {
    try {
      await createRequest({
        contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
        contentId: automationId || '',
        approverIds: [toUserId],
        change: {
          changeType: AUTOMATION_OWNERSHIP_CHANGE_TYPE,
          payload: { toUserId },
          summary,
        },
      });

      await refetch();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Could not ask',
        variant: 'destructive',
      });
    }
  };

  return { pending, loading, submitting, offerOwnership, refetch };
};
