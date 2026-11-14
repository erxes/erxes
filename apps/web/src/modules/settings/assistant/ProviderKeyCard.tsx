import type {
  AssistantConnection,
  AssistantProvider,
  AssistantProviderModels,
} from '@erxes/core-contract';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Input, Label, useConfirm, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';
import { PROVIDER_LABELS } from '~/modules/assistant/providers';

const useKeyMutations = () => {
  const client = useQueryClient();
  const { toast } = useToast();
  const onError = (error: Error) => toast({ variant: 'destructive', title: messageOf(error) });
  const onSuccess = () => client.invalidateQueries({ queryKey: orpc.assistant.key() });

  return {
    save: useMutation(orpc.assistant.saveConnection.mutationOptions({ onSuccess, onError })),
    remove: useMutation(orpc.assistant.removeConnection.mutationOptions({ onSuccess, onError })),
    makeDefault: useMutation(
      orpc.assistant.setDefaultProvider.mutationOptions({ onSuccess, onError }),
    ),
    verify: useMutation(orpc.assistant.verifyModel.mutationOptions({ onError })),
  };
};

const KeyForm = ({ provider, saved }: { provider: AssistantProvider; saved: boolean }) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const id = useId();
  const [apiKey, setApiKey] = useState('');
  const { save } = useKeyMutations();
  const label = PROVIDER_LABELS[provider];

  return (
    <form
      className="flex flex-col gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate({ provider, apiKey: apiKey.trim() }, { onSuccess: () => setApiKey('') });
      }}
    >
      <Label htmlFor={id}>{t('key-label', '{{provider}} API key', { provider: label })}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="password"
          autoComplete="off"
          value={apiKey}
          placeholder={
            saved ? t('key-replace', 'Paste a new key to replace it') : t('key-paste', 'Paste key')
          }
          onChange={(event) => setApiKey(event.target.value)}
        />
        <Button type="submit" disabled={apiKey.trim().length < 8 || save.isPending}>
          {t('save-key', 'Save key')}
        </Button>
      </div>
    </form>
  );
};

const KeyActions = ({
  connection,
  entry,
}: {
  connection: AssistantConnection;
  entry: AssistantProviderModels | undefined;
}) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const { confirm } = useConfirm();
  const { provider } = connection;
  const { remove, makeDefault, verify } = useKeyMutations();
  const model = entry?.models[0]?.id;
  const result = verify.data;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {!connection.isDefault && (
          <Button variant="secondary" onClick={() => makeDefault.mutate({ provider })}>
            {t('make-default', 'Make default')}
          </Button>
        )}
        {model && (
          <Button
            variant="secondary"
            disabled={verify.isPending}
            onClick={() => verify.mutate({ provider, model })}
          >
            {t('test', 'Test key')}
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() =>
            void confirm({
              message: t('remove-confirm', 'Remove your {{provider}} key?', {
                provider: PROVIDER_LABELS[provider],
              }),
              options: { okLabel: t('remove', 'Remove key'), variants: { ok: 'destructive' } },
            }).then(() => remove.mutate({ provider }))
          }
        >
          {t('remove', 'Remove key')}
        </Button>
      </div>
      <output className="text-sm">
        {verify.isPending && t('testing', 'Testing…')}
        {result?.ok && t('works', 'Works with {{model}}', { model: result.model })}
        {result && !result.ok && <span className="text-destructive-text">{result.error}</span>}
      </output>
    </div>
  );
};

export const ProviderKeyCard = ({
  provider,
  connection,
  entry,
}: {
  provider: AssistantProvider;
  connection: AssistantConnection | undefined;
  entry: AssistantProviderModels | undefined;
}) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <h2 id={headingId} className="font-medium">
          {PROVIDER_LABELS[provider]}
        </h2>
        {connection ? (
          <Badge variant="success">{t('saved', 'Key saved')}</Badge>
        ) : (
          <Badge variant="muted">{t('no-key', 'No key')}</Badge>
        )}
        {connection?.isDefault && <Badge>{t('default', 'Default')}</Badge>}
      </div>
      {connection && entry?.error && <p className="text-sm text-destructive-text">{entry.error}</p>}
      <KeyForm provider={provider} saved={Boolean(connection)} />
      {connection && <KeyActions connection={connection} entry={entry} />}
    </section>
  );
};
