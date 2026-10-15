import { AutomationAiAgentDetail } from '@/automations/components/settings/components/agents/components/AutomationAiAgentDetail';
import { AiAgentDetailSheetShell } from '@/automations/components/settings/components/agents/components/detail/AiAgentDetailSheetShell';
import { useAiAgentDetail } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { Sheet, Spinner } from 'erxes-ui';
import { useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ApprovalLockScreen, useApprovalLockState } from 'ui-modules';

/**
 * The agent editor opened over the agents list. It is routed, so links from
 * the builder and approvals still land on it; closing returns to the list.
 * One sheet stays mounted while loading, lock and editor states swap inside.
 */
export const AutomationAiAgentDetailSheet = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  // The editor swaps in its own close so unsaved changes can be confirmed.
  const requestCloseRef = useRef<(() => void) | null>(null);

  const {
    state: lockState,
    loading: lockLoading,
    refetch: refetchLockState,
  } = useApprovalLockState(
    {
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT,
      contentId: id || '',
      action: 'view',
    },
    { skip: !isEdit },
  );
  const isLockedOut = !!lockState?.locked && !lockState.hasAccess;
  const { detail, loading, handleSave } = useAiAgentDetail({
    skip: isEdit && (lockLoading || !lockState || isLockedOut),
  });

  // Back to the list with its filters; the step belongs to the sheet only.
  const close = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tab');
    const query = params.toString();
    navigate(`${AutomationSettingsPath.Agents}${query ? `?${query}` : ''}`);
  };

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
        key={id}
        detail={detail}
        handleSave={handleSave}
        onClose={close}
        requestCloseRef={requestCloseRef}
      />
    );
  };

  return (
    <AiAgentDetailSheetShell
      onRequestClose={() => (requestCloseRef.current || close)()}
    >
      {renderContent()}
    </AiAgentDetailSheetShell>
  );
};
