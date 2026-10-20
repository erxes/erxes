import { AutomationAiAgentDetail } from '@/automations/components/settings/components/agents/components/AutomationAiAgentDetail';
import { AiAgentDetailSheetShell } from '@/automations/components/settings/components/agents/components/detail/AiAgentDetailSheetShell';
import { useAiAgentDetail } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { Sheet, Spinner } from 'erxes-ui';
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
    { skip: !isEdit },
  );
  const isLockedOut = !!lockState?.locked && !lockState.hasAccess;
  const { detail, loading, handleSave } = useAiAgentDetail({
    id: agentId,
    skip: isEdit && (lockLoading || !lockState || isLockedOut),
    onCreated,
  });

  const renderContent = () => {
    if (lockLoading || (isEdit && loading && !detail)) {
      return (
        <>
          <Sheet.Title className="sr-only">Loading agent</Sheet.Title>
          <Spinner />
        </>
      );
    }

    if (isLockedOut && lockState) {
      return (
        <>
          <Sheet.Title className="sr-only">Agent is locked</Sheet.Title>
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
        onClose={onClose}
        requestCloseRef={requestCloseRef}
        persistStepInUrl={persistStepInUrl}
      />
    );
  };

  return (
    <AiAgentDetailSheetShell
      onRequestClose={() => (requestCloseRef.current || onClose)()}
    >
      {renderContent()}
    </AiAgentDetailSheetShell>
  );
};
