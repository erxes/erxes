import { useAutomationDetail } from '@/automations/hooks/useAutomationDetail';
import { BroadcastSteps } from '@/broadcast/components/steps/BroadcastSteps';
import { useBroadcastMessage } from '@/broadcast/hooks/useBroadcastMessage';
import { IBroadcastMethodEnum } from '@/broadcast/types';
import { messageToFormValues } from '@/broadcast/utils/messageToFormValues';
import { BroadcastStepsSheetView } from './steps/BroadcastStepsSheetView';
import { Sheet, Skeleton, useMultiQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BroadcastErrorState } from './list/BroadcastStates';

type TBroadcastEditQueryParams = {
  editMessageId: string;
  method: IBroadcastMethodEnum;
};

/**
 * A campaign is edited through the sheet it was created in.
 *
 * Its name, its recipients and its content are one decision, so opening only
 * the flow — or only the copy — would leave the rest unreachable. Live
 * campaigns never get here: what they are sending is already out.
 */
export const BroadcastEditSheet = () => {
  const [{ editMessageId, method }, setQueryParams] =
    useMultiQueryState<TBroadcastEditQueryParams>(['editMessageId', 'method']);

  const handleClose = () =>
    setQueryParams({ editMessageId: null, method: null });

  return (
    <Sheet
      open={!!editMessageId}
      onOpenChange={(open) => !open && handleClose()}
    >
      <BroadcastStepsSheetView method={method}>
        {editMessageId && (
          <BroadcastEditSheetContent
            messageId={editMessageId}
            onClose={handleClose}
          />
        )}
      </BroadcastStepsSheetView>
    </Sheet>
  );
};

const BroadcastEditSheetContent = ({
  messageId,
  onClose,
}: {
  messageId: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const { message, loading, error, refetch } = useBroadcastMessage({
    variables: { _id: messageId },
  });

  // A workflow campaign keeps its flow on the automation it owns, not on the
  // campaign, so the steps cannot be filled in until that has loaded too.
  const { automation, loading: loadingAutomation } = useAutomationDetail(
    message?.workflowAutomationId,
  );

  const initialValues = useMemo(
    () =>
      messageToFormValues(message, {
        actions: automation?.actions,
        entryActionId: automation?.triggers?.[0]?.actionId,
      }),
    [message, automation],
  );

  // The flow editor seeds its own form once, from the value it mounts with, so
  // the steps must not be rendered before the flow is there to seed it with.
  const isMissingFlow = !!message?.workflowAutomationId && !automation;

  // Without these a campaign that failed to load, or no longer exists, left
  // the sheet on its skeleton for good.
  if (error) {
    return <BroadcastErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!loading && !message?._id) {
    return <BroadcastErrorState error={new Error(t('error.not-found'))} />;
  }

  if (loading || loadingAutomation || isMissingFlow) {
    return <Skeleton className="m-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]" />;
  }

  return (
    <BroadcastSteps
      messageId={messageId}
      initialValues={initialValues}
      onClose={onClose}
    />
  );
};
