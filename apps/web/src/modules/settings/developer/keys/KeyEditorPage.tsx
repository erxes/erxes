import type { ApiKey } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconKey } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, PageContainer, PageHeader, ScrollArea, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { ShownOnce } from '~/components/ShownOnce';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { KeyForm } from './KeyForm';
import { type KeyDraft, draftOf, keyRules, newDraft, opensAny } from './keyDraft';
import { TryKey } from './TryKey';
import { useKeyLookups } from './useKeyLookups';
import { useKeySentence } from './useKeySentence';

const DAY = 86_400_000;

/** The sentence for what the form holds now. */
const useDraftSentence = (draft: KeyDraft, saved?: ApiKey) => {
  const sentence = useKeySentence();
  const { nameOf } = useKeyLookups();
  const [now] = useState(() => Date.now());

  return sentence({
    kind: draft.kind,
    areas: draft.areas,
    scope: draft.scope,
    unitNames: draft.scope === 'units' ? draft.unitIds.map(nameOf) : [],
    tagNames: draft.tagIds.map(nameOf),
    ips: draft.ips,
    until:
      draft.lifetime === 'keep'
        ? (saved?.expiresAt ?? null)
        : draft.lifetime === null
          ? null
          : new Date(now + draft.lifetime * DAY),
  });
};

const Summary = ({
  draft,
  saved,
  busy,
  onSave,
}: {
  draft: KeyDraft;
  saved?: ApiKey;
  busy: boolean;
  onSave: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const sentence = useDraftSentence(draft, saved);
  const ready = Boolean(draft.name.trim()) && opensAny(draft);

  return (
    <aside className="space-y-4 rounded-lg border bg-background p-5 lg:sticky lg:top-6">
      <div className="space-y-1.5">
        <h2 className="text-xs font-semibold uppercase text-muted-foreground">
          {t('summary', 'This key')}
        </h2>
        <p className="text-base leading-relaxed" data-testid="key-sentence">
          {sentence}
        </p>
      </div>
      <Button className="w-full" disabled={!ready || busy} onClick={onSave}>
        {saved ? t('save', 'Save changes') : t('create', 'Create key')}
      </Button>
      {!draft.name.trim() && (
        <p className="text-xs text-muted-foreground">{t('needs-name', 'Give it a name first.')}</p>
      )}
    </aside>
  );
};

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
  const can = useCan();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => (saved ? draftOf(saved, can) : newDraft(can)));
  const [shown, setShown] = useState<{ key: string; id: string } | null>(null);
  const { save, busy } = useSaveKey(saved, (key, id) => setShown({ key, id }));

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
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
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <KeyForm draft={draft} onChange={setDraft} saved={saved?.expiresAt} />
        </div>
        <Summary draft={draft} saved={saved} busy={busy} onSave={() => save(draft)} />
      </div>
      {saved && <TryKey apiKey={saved} />}
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
        {id ? (
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
