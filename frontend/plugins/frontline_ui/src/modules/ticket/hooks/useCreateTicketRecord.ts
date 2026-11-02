import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { TAddTicket } from '@/ticket/types';
import { useQueryState } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';

export type TTicketDraft = Partial<TAddTicket> & {
  customerId?: string;
  companyId?: string;
  onComplete?: (ticketId: string) => void;
};

export const useCreateTicketRecord = () => {
  const [channelId] = useQueryState<string>('channelId');
  const [pipelineId] = useQueryState<string>('pipelineId');
  const { openNewRecord } = useSidePanel();

  const openTicketDraft = (defaults: TTicketDraft = {}, stack = false) =>
    openNewRecord(
      TICKET_PROPERTY_CONTENT_TYPE,
      {
        channelId: channelId || undefined,
        pipelineId: pipelineId || undefined,
        ...defaults,
      },
      { stack },
    );

  return { openTicketDraft };
};
