import { AutomationBuilder } from '@/automations/components/builder/AutomationBuilder';
import { AutomationErrorEmptyState } from '@/automations/components/common/AutomationErrorEmptyState';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { AUTOMATION_DETAIL } from '@/automations/graphql/automationQueries';
import { useAutomationSeed } from '@/automations/hooks/useAutomationSeed';
import { IAutomation } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { PageContainer, Spinner } from 'erxes-ui';
import { useParams } from 'react-router';
import { ApprovalLockScreen, useApprovalLockState } from 'ui-modules';

export const AutomationDetailPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const {
    state: lockState,
    loading: lockLoading,
    refetch: refetchLockState,
  } = useApprovalLockState(
    {
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
      contentId: id || '',
      action: 'view',
    },
    {
      skip: !isEdit,
    },
  );

  const { seed, loading: seedLoading } = useAutomationSeed();

  const { data, loading, error, refetch } = useQuery<{
    automationDetail: IAutomation;
  }>(AUTOMATION_DETAIL, {
    variables: { id },
    skip:
      !id ||
      (isEdit && (lockLoading || !lockState)) ||
      (lockState?.locked === true && !lockState.hasAccess),
  });

  // The builder reads its default values once, so it must not mount before the
  // seed resolves.
  if (lockLoading || loading || seedLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <PageContainer>
        <AutomationErrorEmptyState
          title="Couldn't load this automation"
          error={error}
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  if (lockState?.locked && !lockState.hasAccess) {
    return (
      <PageContainer>
        <ApprovalLockScreen
          state={lockState}
          onRequestCompleted={() => refetchLockState()}
        />
      </PageContainer>
    );
  }

  const detail = data?.automationDetail;

  return (
    <PageContainer>
      <AutomationBuilder detail={detail} seed={id ? undefined : seed} />
    </PageContainer>
  );
};
