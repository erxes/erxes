import { useTicketRemove } from '@/ticket/hooks/useRemoveTicket';
import { useToggleTicketArchive } from '@/ticket/hooks/useToggleTicketArchive';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { ITicketDetail } from '@/ticket/types';
import {
  IconBell,
  IconBellOff,
  IconDotsVertical,
  IconSquareToggle,
  IconTrash,
} from '@tabler/icons-react';
import { Button, DropdownMenu, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const TicketDetailActions = ({ ticket }: { ticket: ITicketDetail }) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { updateTicket } = useUpdateTicket();
  const { removeTicket } = useTicketRemove();
  const { toggleArchive } = useToggleTicketArchive();
  const isArchived = ticket.state === 'archived';
  const isSubscribed = Boolean(ticket.isSubscribed);

  const [pending, setPending] = useState(false);

  const runAction = async (action: () => Promise<unknown>) => {
    if (pending) return;
    setPending(true);
    try {
      await action();
    } finally {
      setPending(false);
    }
  };

  const handleArchiveToggle = () =>
    runAction(() => toggleArchive([ticket._id], isArchived));

  const handleSubscribeToggle = () =>
    runAction(() =>
      updateTicket({
        variables: { _id: ticket._id, isSubscribed: !isSubscribed },
        onCompleted: () => {
          toast({
            title: t('success', 'Success!'),
            variant: 'success',
            description: isSubscribed
              ? t('ticket-unsubscribed', 'Unsubscribed from ticket')
              : t('ticket-subscribed', 'Subscribed to ticket'),
          });
        },
      }),
    );

  const handleDeleteTicket = () =>
    runAction(async () => {
      try {
        await confirm({
          message: t(
            'confirm-delete-ticket',
            'Are you sure you want to delete this ticket?',
          ),
        });
      } catch {
        return;
      }

      try {
        await removeTicket([ticket._id]);
        toast({
          title: t('success', 'Success!'),
          variant: 'success',
          description: t(
            'ticket-deleted-successfully',
            'Ticket deleted successfully',
          ),
        });
      } catch (e) {
        toast({
          title: t('error', 'Error'),
          description: e instanceof Error ? e.message : String(e),
          variant: 'destructive',
        });
      }
    });

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" disabled={pending}>
          <IconDotsVertical />
          {t('actions', 'Actions')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-48 min-w-fit!">
        <DropdownMenu.Item disabled={pending} onSelect={handleArchiveToggle}>
          <IconSquareToggle />
          {isArchived ? t('unarchive', 'Unarchive') : t('archive', 'Archive')}
        </DropdownMenu.Item>
        <DropdownMenu.Item disabled={pending} onSelect={handleSubscribeToggle}>
          {isSubscribed ? <IconBellOff /> : <IconBell />}
          {isSubscribed
            ? t('unsubscribe', 'UnSubscribe')
            : t('subscribe', 'Subscribe')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          disabled={pending}
          onSelect={handleDeleteTicket}
          className="text-destructive"
        >
          <IconTrash />
          {t('delete', 'Delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
