import { useAiAgentDetail } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { useCallback, useRef } from 'react';
import { useApprovalLockState } from 'ui-modules';

/**
 * The agent sheet's state: which of loading, locked or the editor shows, and
 * a close the editor can take over to confirm unsaved changes.
 */
export const useAiAgentDetailSheetContent = (
  agentId: string | undefined,
  onCreated: (agentId: string) => void,
) => {
  const isEdit = Boolean(agentId);
  const requestCloseRef = useRef<(() => void) | null>(null);
  const {
    state: lockState,
    loading: lockLoading,
    refetch: refetchLockState,
  } = useApprovalLockState(
    {
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT,
      contentId: agentId || '',
      action: 'view',
    },
    { skip: !isEdit },
  );
  const isLockedOut = !!lockState?.locked && !lockState.hasAccess;
  const { detail, loading, handleSave } = useAiAgentDetail({
    id: agentId,
    skip: isEdit && (lockLoading || !lockState || isLockedOut),
    onCreated,
  });

  const requestClose = useCallback(
    (close: () => void) => (requestCloseRef.current || close)(),
    [],
  );

  return {
    requestCloseRef,
    lockState,
    isLoading: lockLoading || (isEdit && loading && !detail),
    isLockedOut,
    refetchLockState: () => refetchLockState(),
    detail,
    handleSave,
    title: detail?.name || (isEdit ? 'Agent' : 'New agent'),
    requestClose,
  };
};
