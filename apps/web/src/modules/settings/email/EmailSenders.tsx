import type { EmailSender, EmailSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconMailForward, IconMailPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Empty, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { AddSenderDialog } from './AddSenderDialog';

const domainOf = (address: string) => address.split('@').pop()?.toLowerCase() ?? '';

const useSenderActions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.senders' });
  const { toast } = useToast();
  const client = useQueryClient();

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });

  const resend = useMutation(
    orpc.emails.resendConfirmation.mutationOptions({
      onSuccess: () => toast({ title: t('resent', 'Confirmation link sent again') }),
      onError,
    }),
  );

  const remove = useMutation(
    orpc.emails.removeSender.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.emails.senders.key() }),
      onError,
    }),
  );

  return { resend, remove };
};

/** One sender: its name, address, whether it is confirmed, and how emails will show it. */
const SenderRow = ({ sender, sendingDomain }: { sender: EmailSender; sendingDomain: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.senders' });
  const { confirm } = useConfirm();
  const { resend, remove } = useSenderActions();
  const sentFrom = sendingDomain !== '' && domainOf(sender.email) === sendingDomain;

  return (
    <li className="flex flex-wrap items-center gap-3 p-3 text-sm">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{sender.name}</span>
          <span className="truncate text-muted-foreground">{sender.email}</span>
          <Badge variant={sender.confirmedAt ? 'success' : 'secondary'}>
            {sender.confirmedAt
              ? t('confirmed', 'Confirmed')
              : t('waiting', 'Waiting for the link')}
          </Badge>
        </p>
        <p className="text-xs text-muted-foreground">
          {sentFrom
            ? t('as-from', 'Emails come from this address.')
            : t(
                'as-reply-to',
                'Emails come from your sending address under this name; replies come here.',
              )}
        </p>
      </div>
      <div className="flex gap-1">
        {!sender.confirmedAt && (
          <Button
            size="icon"
            variant="ghost"
            title={t('resend', 'Send the link again')}
            aria-label={t('resend', 'Send the link again')}
            disabled={resend.isPending}
            onClick={() => resend.mutate({ id: sender.id })}
          >
            <IconMailForward />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          tone="destructive"
          title={t('remove', 'Remove')}
          aria-label={t('remove', 'Remove')}
          disabled={remove.isPending}
          onClick={() =>
            void confirm({
              message: t(
                'remove-confirm',
                'Remove {{email}}? Broadcasts and automations using it send from your sending address.',
                { email: sender.email },
              ),
            }).then(() => remove.mutate({ id: sender.id }))
          }
        >
          <IconTrash />
        </Button>
      </div>
    </li>
  );
};

const NoSenders = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.senders' });

  return (
    <Empty variant="outline">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconMailPlus />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No senders yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Add addresses like sales@ or support@ that broadcasts and automations can send as.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** What a sender becomes in an email, with the sending address the organisation has now. */
const HowSendersWork = ({ saved }: { saved: EmailSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.senders' });

  return (
    <p className="rounded-lg border p-4 text-sm text-muted-foreground">
      {saved
        ? t(
            'how-own',
            'A sender on {{domain}} is the From. Any other sender gets the replies, and the email comes from {{address}} under its name.',
            { domain: domainOf(saved.fromEmail), address: saved.fromEmail },
          )
        : t(
            'how-server',
            'Emails come from erxes’s address under the sender’s name, and replies go to the sender. Set up your own sending to send from your domain.',
          )}
    </p>
  );
};

/** Email sending › Senders: addresses broadcasts and automations may send as. */
export const EmailSenders = ({ saved }: { saved: EmailSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.senders' });
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const senders = useQuery(orpc.emails.senders.queryOptions());
  const sendingDomain = saved ? domainOf(saved.fromEmail) : '';

  const closeAdd = (email?: string) => {
    setAdding(false);

    if (email) {
      toast({
        title: t('added', 'Confirmation link sent to {{email}}', { email }),
        description: t('added-description', 'The sender can be picked once the link is opened.'),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <HowSendersWork saved={saved} />
        </div>
        <Button onClick={() => setAdding(true)}>
          <IconMailPlus />
          {t('add', 'Add sender')}
        </Button>
      </div>
      <QueryState query={senders} isEmpty={({ data }) => !data.length} empty={<NoSenders />}>
        {({ data }) => (
          <ul className="divide-y rounded-lg border">
            {data.map((sender) => (
              <SenderRow key={sender.id} sender={sender} sendingDomain={sendingDomain} />
            ))}
          </ul>
        )}
      </QueryState>
      <AddSenderDialog open={adding} onClose={closeAdd} />
    </div>
  );
};
