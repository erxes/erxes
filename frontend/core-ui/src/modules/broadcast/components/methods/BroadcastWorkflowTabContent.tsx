import { useAutomationDetail } from '@/automations/hooks/useAutomationDetail';
import { BroadcastWorkflowEditor } from '@/broadcast/components/workflow/components/BroadcastWorkflowEditor';
import { IconArrowsSplit2 } from '@tabler/icons-react';
import { Empty, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * The campaign's flow, drawn where it belongs.
 *
 * Shown rather than edited: changing a campaign happens in its own edit sheet,
 * beside its recipients and its name, so the flow is never edited through a
 * door that leaves the rest of the campaign behind.
 */
export const BroadcastTabPreviewWorkflowContent = ({
  message,
}: {
  message: { workflowAutomationId?: string };
}) => {
  const { t } = useTranslation('broadcasts');
  const { workflowAutomationId } = message || {};
  const { automation, loading } = useAutomationDetail(workflowAutomationId);

  if (!workflowAutomationId) {
    return (
      <Empty className="my-8">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconArrowsSplit2 />
          </Empty.Media>
          <Empty.Title>{t('workflow.none')}</Empty.Title>
          <Empty.Description>{t('workflow.none-body')}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  if (loading) {
    return <Skeleton className="h-[32rem] w-full" />;
  }

  return (
    <div className="h-[32rem] w-full overflow-hidden rounded-lg border">
      <BroadcastWorkflowEditor
        readOnly
        startLabel={t('workflow.start-customer')}
        value={{
          actions: automation?.actions,
          entryActionId: automation?.triggers?.[0]?.actionId,
        }}
      />
    </div>
  );
};
