import type { EmailReplyTo } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Input, Spinner, useConfirm, useToast } from 'erxes-ui';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSection } from './FormSection';

/** Add, then refresh the list; a failure says why. */
const useReplyToMutations = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const { toast } = useToast();
  const client = useQueryClient();

  const refresh = () => client.invalidateQueries({ queryKey: orpc.emails.replyTos.key() });

  const failed = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('save-failed', 'Could not save'),
      description: messageOf(error),
    });

  const add = useMutation(
    orpc.emails.addReplyTo.mutationOptions({
      onSuccess: (row) => {
        void refresh();
        toast({
          title:
            row.status === 'verified'
              ? t('reply-to-verified', '{{email}} is ready to use', { email: row.email })
              : t('reply-to-sent', 'We emailed a link to {{email}}: it works once confirmed', {
                  email: row.email,
                }),
        });
      },
      onError: failed,
    }),
  );

  const remove = useMutation(
    orpc.emails.removeReplyTo.mutationOptions({ onSuccess: () => void refresh(), onError: failed }),
  );

  return { add, remove };
};

const ReplyToRow = ({
  row,
  onRemove,
  removing,
}: {
  row: EmailReplyTo;
  onRemove: () => void;
  removing: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });

  return (
    <li className="flex items-center gap-3 py-2 text-sm">
      <span className="min-w-0 flex-1 truncate">{row.email}</span>
      {row.status === 'verified' ? (
        <Badge variant="success" size="sm">
          {t('reply-to-status-verified', 'Verified')}
        </Badge>
      ) : (
        <Badge variant="warning" size="sm">
          {t('reply-to-status-pending', 'Waiting for the link')}
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('reply-to-remove', 'Remove {{email}}', { email: row.email })}
        disabled={removing}
        onClick={onRemove}
      >
        <IconTrash />
      </Button>
    </li>
  );
};

/**
 * The addresses broadcasts, automations and plugins may ask replies to go to.
 * `byLink` (SaaS): another address is confirmed by a link sent to it, so no
 * organisation sends with someone else's inbox as its Reply-To. Self-hosted
 * an address is ready as it is added.
 */
export const ReplyTosSection = ({ byLink }: { byLink: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const { confirm } = useConfirm();
  const list = useQuery(orpc.emails.replyTos.queryOptions());
  const { add, remove } = useReplyToMutations();
  const [email, setEmail] = useState('');

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    add.mutate({ email: email.trim() }, { onSuccess: () => setEmail('') });
  };

  return (
    <FormSection
      title={t('section.reply-tos', 'Reply-To addresses')}
      description={
        byLink
          ? t(
              'section.reply-tos-description',
              'Where replies to your emails may go. Each address confirms by a link we email to it.',
            )
          : t('section.reply-tos-description-self', 'Where replies to your emails may go.')
      }
    >
      {list.data && list.data.length > 0 && (
        <ul className="divide-y rounded-lg border px-3">
          {list.data.map((row) => (
            <ReplyToRow
              key={row.id}
              row={row}
              removing={remove.isPending}
              onRemove={() =>
                void confirm({
                  message: t(
                    'reply-to-remove-confirm',
                    'Emails can no longer ask replies to go to {{email}}.',
                    {
                      email: row.email,
                    },
                  ),
                }).then(() => remove.mutate({ id: row.id }))
              }
            />
          ))}
        </ul>
      )}
      <form className="flex gap-2" onSubmit={submit}>
        <Input
          type="email"
          value={email}
          placeholder="support@example.com"
          aria-label={t('reply-to-new', 'New Reply-To address')}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={add.isPending || !email.trim()}>
          {add.isPending ? <Spinner size="sm" /> : t('reply-to-add', 'Add address')}
        </Button>
      </form>
    </FormSection>
  );
};
