import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  Input,
  Label,
  MultipleSelector,
  type MultiSelectOption,
  useToast,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';

/** Every event type, each `source.record.*` prefix, and `*`. */
const useEventOptions = () => {
  const eventTypes = useQuery(orpc.webhooks.eventTypes.queryOptions({ staleTime: 60_000 }));
  const types = eventTypes.data?.data ?? [];

  const prefixes = [
    ...new Set(types.map((item) => item.type.split('.').slice(0, 2).join('.'))),
  ].map((prefix) => ({ value: `${prefix}.*`, label: `${prefix}.* (all)` }));

  return {
    options: [
      { value: '*', label: '* (every event)' },
      ...prefixes,
      ...types.map((item) => ({ value: item.type, label: `${item.label} · ${item.type}` })),
    ],
    error: eventTypes.error,
  };
};

/** Mounted while the dialog is open, so closing it clears what was typed. */
const NewWebhookForm = ({ onCreated }: { onCreated: (secret: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const { toast } = useToast();
  const client = useQueryClient();
  const { options, error } = useEventOptions();
  const urlId = useId();
  const descriptionId = useId();
  const eventsId = useId();
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [types, setTypes] = useState<MultiSelectOption[]>([]);

  const create = useMutation(
    orpc.webhooks.create.mutationOptions({
      onSuccess: ({ secret }) => {
        void client.invalidateQueries({ queryKey: orpc.webhooks.list.key() });
        onCreated(secret);
      },
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('create-failed', 'Could not add the webhook'),
          description: messageOf(failure),
        }),
    }),
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={urlId}>{t('url', 'Endpoint address')}</Label>
        <Input
          id={urlId}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/erxes/webhook"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={descriptionId}>{t('description', 'Description')}</Label>
        <Input
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t('description-placeholder', 'What receives these events?')}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={eventsId}>{t('events', 'Events')}</Label>
        <MultipleSelector
          inputProps={{ id: eventsId }}
          value={types}
          onChange={setTypes}
          defaultOptions={options}
          options={options}
          placeholder={t(
            'events-placeholder',
            'Choose events, a prefix like core.customer.*, or *',
          )}
          hidePlaceholderWhenSelected
        />
        {error && <p className="text-sm text-destructive">{messageOf(error)}</p>}
      </div>
      <Button
        className="w-full"
        disabled={!url || !types.length || create.isPending}
        onClick={() =>
          create.mutate({
            url,
            description: description || null,
            eventTypes: types.map((type) => type.value),
          })
        }
      >
        {t('create', 'Add webhook')}
      </Button>
    </div>
  );
};

export const NewWebhook = ({ onCreated }: { onCreated: (secret: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add', 'Add webhook')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('add', 'Add webhook')}
          description={t(
            'add-description',
            'erxes POSTs each event you choose to this address, signed with a secret.',
          )}
        />
        {open && (
          <NewWebhookForm
            onCreated={(secret) => {
              setOpen(false);
              onCreated(secret);
            }}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
