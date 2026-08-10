import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { useBulkUpdateTickets } from '@/ticket/hooks/useBulkUpdateTickets';
import { useRemoveTicketsFromView } from '@/ticket/hooks/useRemoveTicketsFromView';
import { IconChevronRight, IconGitBranch } from '@tabler/icons-react';
import { Command, useQueryState } from 'erxes-ui';
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
  const { bulkUpdateTickets } = useBulkUpdateTickets();
  const { removeTicketsFromView } = useRemoveTicketsFromView();
  const [pipelineIdFilter] = useQueryState<string>('pipelineId');

  const handleMove = async (targetPipelineId: string) => {
    setOpen(false);

    if (targetPipelineId === pipelineId) {
      return;
    }

    const succeeded = await bulkUpdateTickets(
      ticketIds,
      { pipelineId: targetPipelineId },
      {
        refetchList: true,
        successMessage: t('tickets-moved-successfully'),
      },
    );

    if (
      succeeded &&
      pipelineIdFilter &&
      pipelineIdFilter !== targetPipelineId
    ) {
      removeTicketsFromView(ticketIds);
    }
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
