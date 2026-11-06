import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { TAddTicket } from '@/ticket/types';
import { useQueryState } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { useSidePanel } from 'ui-modules';

export type TTicketDraft = Partial<TAddTicket> & {
  customerId?: string;
  companyId?: string;
  onComplete?: (ticketId: string) => void;
};

export const useCreateTicketRecord = () => {
  const [channelId] = useQueryState<string>('channelId');
  const [pipelineId] = useQueryState<string>('pipelineId');
  const { pathname } = useLocation();
  const isFrontline =
    pathname === '/frontline' || pathname.startsWith('/frontline/');
  const { openNewRecord } = useSidePanel();

  const openTicketDraft = (defaults: TTicketDraft = {}, stack = false) =>
    openNewRecord(
      TICKET_PROPERTY_CONTENT_TYPE,
      {
        ...defaults,
        channelId:
          defaults.channelId ||
          (isFrontline ? channelId : undefined) ||
          undefined,
        pipelineId:
          defaults.pipelineId ||
          (isFrontline ? pipelineId : undefined) ||
          undefined,
      },
      { stack },
    );

  return { openTicketDraft };
};
