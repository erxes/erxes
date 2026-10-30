import { AddTicketForm } from '@/ticket/components/add-ticket/AddTicketForm';
import { ActivityList } from '@/activity/components/ActivityList';
import { isRecord } from '@/shared/utils/isRecord';
import { TicketDetailActions } from '@/ticket/components/ticket-detail/TicketDetailActions';
import { TicketPipelineProperties } from '@/ticket/components/ticket-detail/TicketPipelineProperties';
import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { useTicketCustomFieldEdit } from '@/ticket/hooks/useTicketCustomFieldEdit';
import { IconInfoCircle } from '@tabler/icons-react';
import { Empty, ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IRecordPanelProps } from 'ui-modules';
import { TicketPanelDetail } from './TicketPanelDetail';
import { useRecordPanelDraftSession } from '@/shared/states/recordPanelDraftState';

const TicketPanelEmptyState = ({ message }: { message?: string }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconInfoCircle />
          </Empty.Media>
          <Empty.Title>
            {message ? t('failed-to-load-ticket') : t('ticket-not-found')}
          </Empty.Title>
          <Empty.Description>
            {message || t('ticket-no-longer-available')}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};

const TicketPanel = ({ contentId, view }: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const { ticket, loading, error } = useGetTicket({
    variables: { _id: contentId },
  });

  if (view === 'title') {
    return loading && !ticket ? (
      <Skeleton className="h-4 w-32" />
    ) : (
      ticket?.name || t('ticket-detail')
    );
  }

  if (view === 'actions') {
    return ticket ? <TicketDetailActions ticket={ticket} /> : null;
  }

  if (loading && !ticket) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!ticket) {
    return <TicketPanelEmptyState message={error?.message} />;
  }

  if (view === 'properties') {
    return (
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <div className="p-3">
          <TicketPipelineProperties
            id={contentId}
            propertiesData={
              isRecord(ticket.propertiesData) ? ticket.propertiesData : {}
            }
            mutateHook={useTicketCustomFieldEdit}
          />
        </div>
      </ScrollArea>
    );
  }

  if (view === 'activity') {
    return (
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <div className="p-3">
          <ActivityList
            contentId={contentId}
            contentDetail={ticket}
            preserveDraft
          />
        </div>
      </ScrollArea>
    );
  }

  return <TicketPanelDetail key={contentId} ticket={ticket} />;
};

export const RecordPanel = (props: IRecordPanelProps) => {
  useRecordPanelDraftSession(props);
  if (props.contentType === TICKET_PROPERTY_CONTENT_TYPE)
    return props.view === 'new' ? (
      <AddTicketForm />
    ) : (
      <TicketPanel {...props} />
    );
  return null;
};
