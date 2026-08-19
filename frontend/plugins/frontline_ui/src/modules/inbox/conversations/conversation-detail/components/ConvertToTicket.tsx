import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { getPreviewText } from '@/inbox/types/inbox';
import { parseCallConversationContent } from '@/integrations/call/utils/callContentUtils';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import { ticketCreateDefaultValuesState } from '@/ticket/states/ticketCreateSheetState';
import { TICKETS_DETAIL_QUERY_KEY } from '@/ticket/constants';
import { IconTicket } from '@tabler/icons-react';
import { Button, parseBlocks, stripHtml, useToast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCreateMultipleRelations, useRelations } from 'ui-modules';

const TICKET_NAME_MAX_LENGTH = 100;

const getTicketNameFromContent = (content?: string) => {
  if (!content || parseCallConversationContent(content)) {
    return undefined;
  }

  const text = parseBlocks(content)
    ? getPreviewText(content)
    : stripHtml(content);

  return (
    text.replace(/\s+/g, ' ').trim().slice(0, TICKET_NAME_MAX_LENGTH) ||
    undefined
  );
};

export const ConvertToTicket = () => {
  const { t } = useTranslation('frontline');
  const { _id, content, customerId, assignedUserId, integration } =
    useConversationContext();
  const { toast } = useToast();
  const { createMultipleRelations, error: relationError } =
    useCreateMultipleRelations();
  const { ownEntities } = useRelations({
    variables: {
      contentId: _id,
      contentType: 'frontline:conversation',
      relatedContentType: 'frontline:ticket',
    },
    skip: !_id,
  });
  const setTicketCreateDefaultValues = useSetAtom(
    ticketCreateDefaultValuesState,
  );
  const [open, setOpen] = useState(false);

  const linkedTicketId = ownEntities?.[ownEntities.length - 1]?.contentId;

  useEffect(() => {
    if (!relationError) {
      return;
    }

    toast({
      title: t('error'),
      description: t(
        'ticket-relation-failed',
        'The ticket was created but could not be linked to this conversation.',
      ),
      variant: 'destructive',
    });
  }, [relationError, t, toast]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const name = getTicketNameFromContent(content);

      setTicketCreateDefaultValues({
        ...(integration?.channelId ? { channelId: integration.channelId } : {}),
        ...(name ? { name } : {}),
        ...(assignedUserId ? { assigneeId: assignedUserId } : {}),
      });
    }

    setOpen(nextOpen);
  };

  const handleComplete = (ticketId: string) => {
    const entities: [string, string][] = [
      ['frontline:conversation', _id],
      ...(customerId
        ? ([['core:customer', customerId]] as [string, string][])
        : []),
    ];

    createMultipleRelations(
      entities.map(([contentType, contentId]) => ({
        entities: [
          { contentType, contentId },
          { contentType: 'frontline:ticket', contentId: ticketId },
        ],
      })),
    );
  };

  if (!_id) {
    return null;
  }

  if (linkedTicketId) {
    return (
      <Button variant="outline" className="flex-none" asChild>
        <Link
          to={`/frontline/tickets?${TICKETS_DETAIL_QUERY_KEY}=${linkedTicketId}`}
        >
          <IconTicket />
          {t('open-linked-ticket', 'Go to ticket')}
        </Link>
      </Button>
    );
  }

  return (
    <AddTicketSheet
      open={open}
      onOpenChange={handleOpenChange}
      onComplete={handleComplete}
      label={t('convert-to-ticket', 'Convert to ticket')}
      Icon={IconTicket}
      variant="outline"
      className="flex-none"
      isRelation
    />
  );
};
