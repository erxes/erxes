import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { useRemoveTicketsFromView } from '@/ticket/hooks/useRemoveTicketsFromView';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { IconChevronRight, IconGitBranch } from '@tabler/icons-react';
import { useQueryState, Command, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TicketsMoveToPipelineTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => setCurrentContent('pipeline')}
    >
      <div className="flex gap-2 items-center">
        <IconGitBranch className="size-4" />
        {t('move-to-pipeline')}
      </div>
      <IconChevronRight className="size-4 text-muted-foreground" />
    </Command.Item>
  );
};

export const TicketsMoveToPipelineContent = ({
  ticketIds,
  channelId,
  pipelineId,
  setOpen,
}: {
  ticketIds: string[];
  channelId: string;
  pipelineId?: string;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { updateTicket } = useUpdateTicket();
  const { removeTicketsFromView } = useRemoveTicketsFromView();
  const [pipelineIdFilter] = useQueryState<string>('pipelineId');

  const handleMove = async (targetPipelineId: string) => {
    if (targetPipelineId === pipelineId) {
      setOpen(false);
      return;
    }

    let failedMessage = '';

    await Promise.all(
      ticketIds.map((ticketId) =>
        updateTicket({
          variables: {
            _id: ticketId,
            pipelineId: targetPipelineId,
          },
          refetchQueries: [GET_TICKETS],
          onError: (error) => {
            failedMessage = failedMessage || error.message;
          },
        }),
      ),
    );

    setOpen(false);

    if (failedMessage) {
      toast({
        title: t('error'),
        description: failedMessage,
        variant: 'destructive',
      });
      return;
    }

    if (pipelineIdFilter && pipelineIdFilter !== targetPipelineId) {
      removeTicketsFromView(ticketIds);
    }

    toast({
      title: t('success'),
      variant: 'success',
      description: t('tickets-moved-successfully'),
    });
  };

  return (
    <SelectPipeline.Provider
      value={pipelineId || ''}
      channelId={channelId}
      onValueChange={handleMove}
    >
      <SelectPipeline.Content />
    </SelectPipeline.Provider>
  );
};
