import { useAutomationDetail } from '@/automations/hooks/useAutomationDetail';
import { BroadcastSteps } from '@/broadcast/components/steps/BroadcastSteps';
import { useBroadcastMessage } from '@/broadcast/hooks/useBroadcastMessage';
import { IBroadcastMethodEnum } from '@/broadcast/types';
import { messageToFormValues } from '@/broadcast/utils/messageToFormValues';
import { cn, Sheet, Skeleton, useMultiQueryState } from 'erxes-ui';
import { useMemo } from 'react';

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
      <Sheet.View
        className={cn(
          'sm:max-w-7xl',
          // Matches the creation sheet: the canvas is the campaign's content,
          // so a workflow gets the room a form-based method does not need.
          method === IBroadcastMethodEnum.WORKFLOW &&
            'sm:max-w-none md:w-[calc(100vw-1rem)]',
        )}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {editMessageId && (
          <BroadcastEditSheetContent
            messageId={editMessageId}
            onClose={handleClose}
          />
        )}
      </Sheet.View>
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
  const { message, loading } = useBroadcastMessage({
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

  if (loading || loadingAutomation || !message?._id || isMissingFlow) {
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
