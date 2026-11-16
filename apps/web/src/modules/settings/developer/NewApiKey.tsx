import { API_KEY_LIFETIMES } from '@erxes/core-contract';
import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Select, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';

type Lifetime = (typeof API_KEY_LIFETIMES)[number];

const NEVER = 'never';

const lifetimeOf = (value: string): Lifetime | null =>
  API_KEY_LIFETIMES.find((days) => String(days) === value) ?? null;

/** Mounted while the dialog is open, so closing it clears what was typed. */
const NewApiKeyForm = ({ onCreated }: { onCreated: (key: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const { toast } = useToast();
  const client = useQueryClient();
  const nameId = useId();
  const lifetimeId = useId();
  const [name, setName] = useState('');
  const [lifetime, setLifetime] = useState('90');

  const create = useMutation(
    orpc.apiKeys.create.mutationOptions({
      onSuccess: ({ key }) => {
        void client.invalidateQueries({ queryKey: orpc.apiKeys.list.key() });
        onCreated(key);
      },
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('create-failed', 'Could not create the key'),
          description: messageOf(failure),
        }),
    }),
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate({ name: name.trim(), lifetimeDays: lifetimeOf(lifetime) });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={nameId}>{t('name', 'Name')}</Label>
        <Input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('name-placeholder', 'What uses this key?')}
          maxLength={100}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={lifetimeId}>{t('expires', 'Expires')}</Label>
        <Select value={lifetime} onValueChange={(next) => next && setLifetime(next)}>
          <Select.Trigger id={lifetimeId}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {API_KEY_LIFETIMES.map((days) => (
              <Select.Item key={days} value={String(days)}>
                {t('in-days', { count: days, defaultValue: `In ${days} days` })}
              </Select.Item>
            ))}
            <Select.Item value={NEVER}>{t('never', 'Never')}</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={!name.trim() || create.isPending}>
        {t('create', 'Create key')}
      </Button>
    </form>
  );
};

export const NewApiKey = ({ onCreated }: { onCreated: (key: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button />}>
        <IconPlus />
        {t('add', 'New API key')}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('add', 'New API key')}
          description={t(
            'add-description',
            'The key acts as you, with your role’s permissions as they are at each call.',
          )}
        />
        {open && (
          <NewApiKeyForm
            onCreated={(key) => {
              setOpen(false);
              onCreated(key);
            }}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
