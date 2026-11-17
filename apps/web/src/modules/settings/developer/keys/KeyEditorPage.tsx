import type { ApiKey } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconKey } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, PageContainer, PageHeader, ScrollArea, Spinner, Tabs, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { ShownOnce } from '~/components/ShownOnce';
import { paths } from '~/lib/paths';
import { KeyForm } from './KeyForm';
import { type KeyDraft, draftOf, keyRules, newDraft } from './keyDraft';
import { KeySummary } from './KeySummary';
import { TryKey } from './TryKey';
import { useGiver, useKeyPlugins } from './useKeyPlugins';

const useSaveKey = (saved: ApiKey | undefined, onCreated: (key: string, id: string) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const { toast } = useToast();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: orpc.apiKeys.list.key() });

  const failed = (failure: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Could not save the key'),
      description: messageOf(failure),
    });

  const create = useMutation(
    orpc.apiKeys.create.mutationOptions({
      onSuccess: ({ key, apiKey }) => {
        void refresh();
        onCreated(key, apiKey.id);
      },
      onError: failed,
    }),
  );

  const update = useMutation(
    orpc.apiKeys.update.mutationOptions({
      onSuccess: () => {
        void refresh();
        toast({ title: t('saved', 'Saved') });
      },
      onError: failed,
    }),
  );

  const save = (draft: KeyDraft) => {
    const rules = keyRules(draft);

    if (saved) {
      update.mutate({
        id: saved.id,
        ...rules,
        ...(draft.lifetime === 'keep' ? {} : { lifetimeDays: draft.lifetime }),
      });
    } else {
      create.mutate({ ...rules, lifetimeDays: draft.lifetime === 'keep' ? null : draft.lifetime });
    }
  };

  return { save, busy: create.isPending || update.isPending };
};

const KeyEditor = ({ saved }: { saved?: ApiKey }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const giver = useGiver();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => (saved ? draftOf(saved, giver) : newDraft(giver)));
  const [shown, setShown] = useState<{ key: string; id: string } | null>(null);
  const { save, busy } = useSaveKey(saved, (key, id) => setShown({ key, id }));

  const form = (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <div className="min-w-0 lg:col-span-2">
        <KeyForm draft={draft} onChange={setDraft} saved={saved?.expiresAt} />
      </div>
      <KeySummary draft={draft} saved={saved} busy={busy} onSave={() => save(draft)} />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      {saved?.kind === 'member' && (
        <Alert>
          <Alert.Title>{t('old-title', 'This key was made before rules')}</Alert.Title>
          <Alert.Description>
            {t(
              'old-text',
              'It can do everything {{name}} can. Choose what it may do and save to limit it.',
              {
                name: saved.memberName ?? saved.memberEmail,
              },
            )}
          </Alert.Description>
        </Alert>
      )}
      {saved ? (
        <Tabs defaultValue="access">
          <Tabs.List variant="underline" className="mb-4">
            <Tabs.Trigger value="access">{t('tab-access', 'Access')}</Tabs.Trigger>
            <Tabs.Trigger value="try">{t('tab-try', 'Try this key')}</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="access">{form}</Tabs.Content>
          <Tabs.Content value="try">
            <TryKey apiKey={saved} />
          </Tabs.Content>
        </Tabs>
      ) : (
        form
      )}
      {shown && (
        <ShownOnce
          value={shown.key}
          title={t('key-title', 'Your API key')}
          description={t(
            'key-description',
            'Copy it now: it won\'t be shown again. Send it with each call as "Authorization: Bearer <key>".',
          )}
          onClose={() => {
            void navigate(paths.settings.apiKeyOf(shown.id));
            setShown(null);
          }}
        />
      )}
    </div>
  );
};

/** Settings › API keys › New key, or one key: what it may do, and "Try this key". */
export const KeyEditorPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const { id } = useParams();
  const keys = useQuery({ ...orpc.apiKeys.list.queryOptions(), enabled: Boolean(id) });
  const saved = keys.data?.data.find((key) => key.id === id);
  const { loading: pluginsLoading } = useKeyPlugins();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'API keys'), to: paths.settings.apiKeys, icon: IconKey },
              id
                ? { label: saved?.name ?? '…', to: paths.settings.apiKeyOf(id) }
                : { label: t('form.new', 'New key'), to: paths.settings.apiKeyNew },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        {pluginsLoading ? (
          <Spinner className="mx-auto my-12" />
        ) : id ? (
          <QueryState query={keys} className="py-12">
            {() =>
              saved ? (
                <KeyEditor key={saved.id} saved={saved} />
              ) : (
                <p className="p-6">{t('form.missing', 'This key is gone.')}</p>
              )
            }
          </QueryState>
        ) : (
          <KeyEditor />
        )}
      </ScrollArea>
    </PageContainer>
  );
};
