import { API_KEY_AREA_INFO, type ApiKeyAccess, type ApiKeyArea } from '@erxes/core-contract';
import {
  IconBolt,
  IconCreditCard,
  IconFile,
  IconKey,
  IconPackage,
  IconPuzzle,
  IconSettings,
  IconUsers,
  IconUsersGroup,
  IconWebhook,
  type Icon,
} from '@tabler/icons-react';
import { Badge, cn } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import {
  canGive,
  chooseActions,
  fitsLimits,
  isLimited,
  type KeyDraft,
  setAccess,
  tickedIn,
} from './keyDraft';
import { type Level, LevelPicker, type Pickable, Picker } from './AccessPicker';
import type { DraftProps } from './keyParts';
import { type KeyCallChoice, useKeyCalls } from './useKeyCalls';
import { type KeyPlugin, useKeyPlugins } from './useKeyPlugins';

export const AREA_ICONS: Record<ApiKeyArea, Icon> = {
  contacts: IconUsers,
  products: IconPackage,
  payments: IconCreditCard,
  files: IconFile,
  automations: IconBolt,
  team: IconUsersGroup,
  keys: IconKey,
  plugins: IconPuzzle,
  webhooks: IconWebhook,
  settings: IconSettings,
};

/** One area or plugin: its icon, what it covers, its level, and the picker when choosing. */
const AccessRow = ({
  icon: RowIcon,
  label,
  note,
  level,
  summary,
  picker,
  ...levels
}: {
  icon: Icon;
  label: string;
  note: string | null;
  level: Level;
  summary: string | null;
  picker: ReactNode;
  disabled: boolean;
  writable: boolean;
  choosable: boolean;
  onChange: (level: Level) => void;
}) => (
  <div className="py-3">
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
          level !== 'off' && 'bg-primary/10 text-primary',
        )}
      >
        <RowIcon size={18} />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="flex items-center gap-2 text-sm font-medium">
          {label}
          {summary && <Badge variant="secondary">{summary}</Badge>}
        </p>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
      <LevelPicker label={label} value={level} {...levels} />
    </div>
    {level === 'choose' && <div className="mt-3 sm:pl-12">{picker}</div>}
  </div>
);

const levelOf = (draft: KeyDraft, name: string, access: ApiKeyAccess | undefined): Level =>
  draft.actions[name] ? 'choose' : (access ?? 'off');

/** An area's calls, the ones ticked, and how picking a level or calls changes the draft. */
const useAreaCalls = (area: ApiKeyArea, draft: KeyDraft, onChange: (draft: KeyDraft) => void) => {
  const can = useCan();
  const { inArea } = useKeyCalls();
  const calls = inArea(area);
  const allowed = (call: KeyCallChoice) => !call.permission || can(call.permission);

  const ticked = tickedIn(
    draft,
    area,
    calls.map((call) => call.name),
  );

  const choose = (names: readonly string[]) =>
    onChange(
      chooseActions(
        draft,
        area,
        names,
        calls.some((call) => call.access === 'write' && names.includes(call.name)),
      ),
    );

  const pick = (level: Level) => {
    const open = draft.areas[area];

    if (level !== 'choose') onChange(setAccess(draft, area, level === 'off' ? undefined : level));
    else {
      choose(
        calls
          .filter((call) => open && (open === 'write' || call.access === 'read') && allowed(call))
          .map((call) => call.name),
      );
    }
  };

  const items = (access: ApiKeyAccess): Pickable[] =>
    calls
      .filter((call) => call.access === access)
      .map((call) => ({
        name: call.name,
        label: call.label,
        description: call.description,
        tag: call.method,
        detail: call.path,
        allowed: allowed(call),
      }));

  return { calls, ticked, choose, pick, items };
};

export const AreaRow = ({
  area,
  draft,
  onChange,
}: {
  area: ApiKeyArea;
  draft: KeyDraft;
  onChange: (draft: KeyDraft) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const can = useCan();
  const info = API_KEY_AREA_INFO[area];
  const readable = canGive(area, 'read', can);
  const disabled = !readable || !fitsLimits(draft, area);
  const { calls, ticked, choose, pick, items } = useAreaCalls(area, draft, onChange);

  return (
    <AccessRow
      icon={AREA_ICONS[area]}
      label={t(`area.${area}`, info.label)}
      note={
        readable ? t(`covers.${area}`, info.covers) : t('not-yours', "Your role can't use this")
      }
      level={levelOf(draft, area, draft.areas[area])}
      summary={
        draft.actions[area]
          ? t('calls-chosen', '{{count}} of {{total}} calls', {
              count: ticked.length,
              total: calls.length,
            })
          : null
      }
      disabled={disabled}
      writable={canGive(area, 'write', can)}
      choosable={calls.length > 1}
      onChange={pick}
      picker={
        <Picker
          groups={[
            { title: t('calls-read', 'Read'), items: items('read') },
            { title: t('calls-write', 'Change'), items: items('write') },
          ]}
          ticked={ticked}
          disabled={disabled}
          onChange={choose}
        />
      }
    />
  );
};

const PluginRow = ({
  plugin,
  draft,
  onChange,
}: {
  plugin: KeyPlugin;
  draft: KeyDraft;
  onChange: (draft: KeyDraft) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const can = useCan();
  const names = plugin.actions.map(({ action }) => action);
  const ticked = tickedIn(draft, plugin.name, names);
  const disabled = !plugin.usable || isLimited(draft);

  const choose = (next: readonly string[]) =>
    onChange(chooseActions(draft, plugin.name, next, true));

  const pick = (level: Level) =>
    level === 'choose'
      ? choose(draft.plugins[plugin.name] ? names.filter(can) : [])
      : onChange(setAccess(draft, plugin.name, level === 'off' ? undefined : level));

  return (
    <AccessRow
      icon={IconPuzzle}
      label={plugin.title}
      note={plugin.usable ? plugin.description : t('not-yours', "Your role can't use this")}
      level={levelOf(draft, plugin.name, draft.plugins[plugin.name])}
      summary={
        draft.actions[plugin.name]
          ? t('actions-chosen', '{{count}} of {{total}} actions', {
              count: ticked.length,
              total: names.length,
            })
          : null
      }
      disabled={disabled}
      writable
      choosable={names.length > 1}
      onChange={pick}
      picker={
        <Picker
          groups={[
            {
              title: t('plugin-actions', 'Actions'),
              items: plugin.actions.map(({ action, label }) => ({
                name: action,
                label,
                allowed: can(action),
              })),
            },
          ]}
          ticked={ticked}
          disabled={disabled}
          onChange={choose}
        />
      }
    />
  );
};

/** The installed plugins in "Custom", each its own row. */
export const PluginRows = ({ draft, onChange }: DraftProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const { plugins } = useKeyPlugins();

  if (draft.kind !== 'regular' || !plugins.length) return null;

  return (
    <div className="pb-1">
      <p className="pt-4 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {t('plugins-title', 'Plugins')}
      </p>
      <div className="divide-y">
        {plugins.map((plugin) => (
          <PluginRow key={plugin.name} plugin={plugin} draft={draft} onChange={onChange} />
        ))}
      </div>
    </div>
  );
};
