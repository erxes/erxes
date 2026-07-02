import { AutomationAiAgentDetail } from '@/automations/components/settings/components/agents/components/AutomationAiAgentDetail';
import { useAiAgentDetail } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { Spinner } from 'erxes-ui';
import { useParams } from 'react-router';
import { ApprovalLockScreen, useApprovalLockState } from 'ui-modules';

export const AutomationAiAgentDetailSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id && id !== 'create');
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
    {
      skip: !isEdit,
    },
  );
  const { detail, handleSave } = useAiAgentDetail({
    skip:
      isEdit &&
      (lockLoading ||
        !lockState ||
        (lockState.locked === true && !lockState.hasAccess)),
  });

  if (lockLoading) {
    return <Spinner />;
  }

  if (lockState?.locked && !lockState.hasAccess) {
    return (
      <ApprovalLockScreen
        state={lockState}
        onRequestCompleted={() => refetchLockState()}
      />
    );
  }

  return <AutomationAiAgentDetail detail={detail} handleSave={handleSave} />;
};
