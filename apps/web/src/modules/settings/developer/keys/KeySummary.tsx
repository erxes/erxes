import { API_KEY_AREA_INFO, type ApiKey } from '@erxes/core-contract';
import { IconKey } from '@tabler/icons-react';
import { Badge, Button, Separator } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { areasOf, type KeyDraft, opensAny } from './keyDraft';
import { useKeyCalls } from './useKeyCalls';
import { useKeyLookups } from './useKeyLookups';
import { useKeyPlugins } from './useKeyPlugins';
import { useKeySentence } from './useKeySentence';

const DAY = 86_400_000;

/** The sentence for what the form holds now. */
const useDraftSentence = (draft: KeyDraft, saved?: ApiKey) => {
  const sentence = useKeySentence();
  const { nameOf } = useKeyLookups();
  const { titled } = useKeyPlugins();
  const [now] = useState(() => Date.now());

  return sentence({
    kind: draft.kind,
    areas: draft.areas,
    plugins: titled(draft.plugins),
    actions: draft.actions,
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

/** Each area and plugin the key opens, with how far: read, read and write, or some calls. */
const useOpened = (draft: KeyDraft) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const { inArea } = useKeyCalls();
  const { plugins } = useKeyPlugins();

  const levelOf = (name: string, access: string, total: number) => {
    const chosen = draft.actions[name];

    if (chosen) {
      return t('calls-chosen', '{{count}} of {{total}} calls', { count: chosen.length, total });
    }

    return access === 'write' ? t('level-write', 'Read & write') : t('read', 'Read');
  };

  return [
    ...areasOf(draft.kind).flatMap((area) => {
      const access = draft.areas[area];

      return access
        ? [
            {
              name: area,
              label: t(`area.${area}`, API_KEY_AREA_INFO[area].label),
              level: levelOf(area, access, inArea(area).length),
            },
          ]
        : [];
    }),
    ...plugins.flatMap((plugin) => {
      const access = draft.plugins[plugin.name];

      return access
        ? [
            {
              name: plugin.name,
              label: plugin.title,
              level: levelOf(plugin.name, access, plugin.actions.length),
            },
          ]
        : [];
    }),
  ];
};

/** The key as the form holds it: its sentence, what it opens, and the button that saves it. */
export const KeySummary = ({
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
  const opened = useOpened(draft);
  const ready = Boolean(draft.name.trim()) && opensAny(draft);

  return (
    <aside className="space-y-4 rounded-lg border bg-background p-5 lg:sticky lg:top-6">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <IconKey size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {draft.name.trim() || t('summary', 'This key')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {draft.kind === 'regular'
              ? t('regular', 'Regular key')
              : t('management', 'Management key')}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed" data-testid="key-sentence">
        {sentence}
      </p>
      {opened.length > 0 && (
        <>
          <Separator />
          <ul className="space-y-2">
            {opened.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{item.label}</span>
                <Badge variant="secondary">{item.level}</Badge>
              </li>
            ))}
          </ul>
        </>
      )}
      <Button className="w-full" disabled={!ready || busy} onClick={onSave}>
        {saved ? t('save', 'Save changes') : t('create', 'Create key')}
      </Button>
      {!draft.name.trim() && (
        <p className="text-xs text-muted-foreground">{t('needs-name', 'Give it a name first.')}</p>
      )}
    </aside>
  );
};
