import { AutomationAiAgentDetail } from '@/automations/components/settings/components/agents/components/AutomationAiAgentDetail';
import { AiAgentDetailSheetShell } from '@/automations/components/settings/components/agents/components/detail/AiAgentDetailSheetShell';
import { useAiAgentDetailSheetContent } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetailSheetContent';
import { Spinner } from 'erxes-ui';
import { ApprovalLockScreen } from 'ui-modules';

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
  const {
    requestCloseRef,
    lockState,
    isLoading,
    isLockedOut,
    refetchLockState,
    detail,
    handleSave,
    title,
    requestClose,
  } = useAiAgentDetailSheetContent(agentId, onCreated);

  const renderContent = (close: () => void) => {
    if (isLoading) {
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
            onRequestCompleted={refetchLockState}
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
      title={title}
      identity={agentId || 'new'}
      onClose={onClose}
      onRequestClose={requestClose}
    >
      {renderContent}
    </AiAgentDetailSheetShell>
  );
};
