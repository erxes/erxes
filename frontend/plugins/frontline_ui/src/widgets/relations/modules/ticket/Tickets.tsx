import { useConversationDetail } from '@/inbox/conversations/conversation-detail/hooks/useConversationDetail';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import { ticketCreateDefaultValuesState } from '@/ticket/states/ticketCreateSheetState';
import { IconTicketOff } from '@tabler/icons-react';
import { Spinner, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IRelationWidgetProps,
  RelationWidgetContactsSection,
  RelationWidgetEmptyState,
  RelationWidgetList,
  useContactRelations,
  useRelateRecord,
  useRelations,
} from 'ui-modules';
import { TicketWidget } from './TicketWidget';

export const TicketRelationWidget = ({
  contentId,
  contentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: IRelationWidgetProps) => {
  const { t } = useTranslation('frontline');
  const { relatedIds, loading } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'frontline:ticket',
    },
  });

  const { relateRecord } = useRelateRecord({
    contentType,
    contentId,
    relatedContentType: 'frontline:ticket',
    customerId,
    companyId,
    customerIds,
    companyIds,
  });

  const contactRecords = useContactRelations({
    contentType,
    contentId,
    relatedContentType: 'frontline:ticket',
    customerId,
    companyId,
    customerIds,
    companyIds,
    excludeIds: relatedIds,
  });

  const setTicketCreateDefaultValues = useSetAtom(
    ticketCreateDefaultValuesState,
  );
  const [conversationId] = useQueryState<string | null>('conversationId');

  const { conversationDetail } = useConversationDetail({
    variables: {
      _id: conversationId || '',
    },
    skip: !conversationId,
  });

  useEffect(() => {
    if (!conversationDetail?.integration?.channelId) return;
    setTicketCreateDefaultValues({
      channelId: conversationDetail?.integration.channelId || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationDetail]);

  if (loading || contactRecords.loading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (relatedIds.length === 0 && contactRecords.relatedIds.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconTicketOff}
        message={t(
          'no-tickets-to-display',
          'No tickets to display at the moment.',
        )}
      >
        <AddTicketSheet
          onComplete={relateRecord}
          variant="secondary"
          isRelation={true}
        />
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      label={t('tickets', 'Tickets')}
      actions={
        <AddTicketSheet
          onComplete={relateRecord}
          variant="secondary"
          isRelation={true}
        />
      }
    >
      {relatedIds.map((ticketId) => (
        <TicketWidget key={ticketId} ticketId={ticketId} />
      ))}
      {contactRecords.relatedIds.length > 0 && (
        <RelationWidgetContactsSection>
          {contactRecords.relatedIds.map((ticketId) => (
            <TicketWidget key={ticketId} ticketId={ticketId} />
          ))}
        </RelationWidgetContactsSection>
      )}
    </RelationWidgetList>
  );
};
