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
import { lazy, Suspense } from 'react';
import {
  KB_RECORD_CONTENT_TYPES,
  KB_DRAFT_CONTENT_TYPES,
} from '@/knowledgebase/constants';
import { HELP_CENTER_CONTENT_TYPE } from '@/helpcenter/constants';
import { INTEGRATION_CONTENT_TYPE } from '@/integrations/components/IntegrationPanelForm';

const KNOWLEDGE_BASE_CONTENT_TYPES: string[] = [
  ...Object.values(KB_RECORD_CONTENT_TYPES),
  ...Object.values(KB_DRAFT_CONTENT_TYPES),
];

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

const IntegrationRecordPanel = lazy(() =>
  import('./IntegrationRecordPanel').then((module) => ({
    default: module.IntegrationRecordPanel,
  })),
);

const KnowledgeBaseRecordPanel = lazy(() =>
  import('./KnowledgeBaseRecordPanel').then((module) => ({
    default: module.KnowledgeBaseRecordPanel,
  })),
);

const HelpCenterRecordPanel = lazy(() =>
  import('./HelpCenterRecordPanel').then((module) => ({
    default: module.HelpCenterRecordPanel,
  })),
);

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
            key={contentId}
            contentId={contentId}
            contentDetail={ticket}
          />
        </div>
      </ScrollArea>
    );
  }

  return <TicketPanelDetail key={contentId} ticket={ticket} />;
};

export const RecordPanel = (props: IRecordPanelProps) => {
  if (props.contentType === INTEGRATION_CONTENT_TYPE) {
    return (
      <Suspense fallback={<Spinner containerClassName="py-12" />}>
        <IntegrationRecordPanel {...props} />
      </Suspense>
    );
  }
  if (props.contentType === HELP_CENTER_CONTENT_TYPE) {
    return (
      <Suspense fallback={<Spinner containerClassName="py-12" />}>
        <HelpCenterRecordPanel {...props} />
      </Suspense>
    );
  }
  if (props.contentType === TICKET_PROPERTY_CONTENT_TYPE)
    return props.view === 'new' ? (
      <AddTicketForm />
    ) : (
      <TicketPanel {...props} />
    );
  if (KNOWLEDGE_BASE_CONTENT_TYPES.includes(props.contentType)) {
    return (
      <Suspense fallback={<Spinner containerClassName="py-12" />}>
        <KnowledgeBaseRecordPanel {...props} />
      </Suspense>
    );
  }
  return null;
};
