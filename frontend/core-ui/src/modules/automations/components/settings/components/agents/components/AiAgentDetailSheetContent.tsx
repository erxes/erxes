import { AutomationAiAgentDetail } from '@/automations/components/settings/components/agents/components/AutomationAiAgentDetail';
import { AiAgentDetailSheetShell } from '@/automations/components/settings/components/agents/components/detail/AiAgentDetailSheetShell';
import { useAiAgentDetail } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { Spinner } from 'erxes-ui';
import { useRef } from 'react';
import { ApprovalLockScreen, useApprovalLockState } from 'ui-modules';

/**
 * The agent editor sheet, independent of where it is opened from. The host
 * owns which agent is shown and what closing or creating does.
 * One sheet stays mounted while loading, lock and editor states swap inside.
 */
export const AiAgentDetailSheetContent = ({
  agentId,
  onClose,
  onCreated,
  persistStepInUrl,
}: {
  agentId?: string;
  onClose: () => void;
  onCreated: (agentId: string) => void;
  persistStepInUrl: boolean;
}) => {
  const isEdit = Boolean(agentId);
  // The editor swaps in its own close so unsaved changes can be confirmed.
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
    {
      skip: !isEdit,
    },
  );
  const isLockedOut = !!lockState?.locked && !lockState.hasAccess;
  const { detail, loading, handleSave } = useAiAgentDetail({
    id: agentId,
    skip: isEdit && (lockLoading || !lockState || isLockedOut),
    onCreated,
  });
  const renderContent = (close: () => void) => {
    if (lockLoading || (isEdit && loading && !detail)) {
      return (
        <>
          <span className="sr-only">Loading agent</span>
          <Spinner />
        </>
      );
    }
    if (isLockedOut && lockState) {
      return (
        <>
          <span className="sr-only">Agent is locked</span>
          <ApprovalLockScreen
            state={lockState}
            onRequestCompleted={() => refetchLockState()}
          />
        </>
      );
    }
    return (
      <AutomationAiAgentDetail
        key={agentId}
        detail={detail}
        handleSave={handleSave}
        onClose={close}
        requestCloseRef={requestCloseRef}
        persistStepInUrl={persistStepInUrl}
      />
    );
  };
  return (
    <AiAgentDetailSheetShell
      title={detail?.name || (isEdit ? 'Agent' : 'New agent')}
      identity={agentId || 'new'}
      onClose={onClose}
      onRequestClose={(close) => (requestCloseRef.current || close)()}
    >
      {renderContent}
    </AiAgentDetailSheetShell>
  );
};
