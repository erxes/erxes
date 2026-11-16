import { API_KEY_AREA_INFO, type ApiKeyAccess, type ApiKeyArea } from '@erxes/core-contract';
import { ChoiceboxGroup, Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCan, useSession } from '~/modules/auth/session';
import {
  areasOf,
  canGive,
  fitsLimits,
  isLimited,
  type KeyKind,
  type Preset,
  presetAccess,
} from './keyDraft';
import { Choice, type DraftProps } from './keyParts';
import { type KeyPlugin, useGiver, useKeyPlugins } from './useKeyPlugins';

const OFF = 'off';

/** One row in "Custom": off, read, or read and write, as far as the member may give it. */
const AccessRow = ({
  label,
  note,
  value,
  writable,
  disabled,
  onChange,
}: {
  label: string;
  note: string | null;
  value: ApiKeyAccess | undefined;
  writable: boolean;
  disabled: boolean;
  onChange: (access: ApiKeyAccess | undefined) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
      <Select
        value={value ?? OFF}
        disabled={disabled}
        onValueChange={(next) => onChange(next === 'read' || next === 'write' ? next : undefined)}
      >
        <Select.Trigger className="w-40" aria-label={label}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={OFF}>{t('off', 'No access')}</Select.Item>
          <Select.Item value="read">{t('read', 'Read')}</Select.Item>
          {writable && <Select.Item value="write">{t('write', 'Read and write')}</Select.Item>}
        </Select.Content>
      </Select>
    </div>
  );
};

const AreaRow = ({
  area,
  value,
  limited,
  onChange,
}: {
  area: ApiKeyArea;
  value: ApiKeyAccess | undefined;
  limited: boolean;
  onChange: (access: ApiKeyAccess | undefined) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const can = useCan();
  const info = API_KEY_AREA_INFO[area];
  const readable = canGive(area, 'read', can);

  return (
    <AccessRow
      label={t(`area.${area}`, info.label)}
      note={
        readable ? t(`covers.${area}`, info.covers) : t('not-yours', "Your role can't use this")
      }
      value={value}
      writable={canGive(area, 'write', can)}
      disabled={!readable || limited}
      onChange={onChange}
    />
  );
};

/** The installed plugins in "Custom", each its own row. */
const PluginRows = ({ draft, onChange }: DraftProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const { plugins } = useKeyPlugins();

  if (draft.kind !== 'regular' || !plugins.length) return null;

  const set = (plugin: KeyPlugin, access: ApiKeyAccess | undefined) => {
    const { [plugin.name]: _dropped, ...rest } = draft.plugins;

    onChange({ ...draft, plugins: access ? { ...rest, [plugin.name]: access } : rest });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t('plugins-title', 'Plugins')}</p>
      <div className="divide-y rounded-md border px-4">
        {plugins.map((plugin) => (
          <AccessRow
            key={plugin.name}
            label={plugin.title}
            note={plugin.usable ? plugin.description : t('not-yours', "Your role can't use this")}
            value={draft.plugins[plugin.name]}
            writable
            disabled={!plugin.usable || isLimited(draft)}
            onChange={(access) => set(plugin, access)}
          />
        ))}
      </div>
    </div>
  );
};

/** Regular or management. A management key needs an owner or admin, and an expiry. */
export const KindSection = ({ draft, onChange }: DraftProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const giver = useGiver();
  const { user } = useSession();
  const setupAllowed = user.role === 'owner' || user.role === 'admin';

  const setKind = (kind: KeyKind) =>
    onChange({
      ...draft,
      kind,
      preset: draft.preset === 'custom' ? 'read' : draft.preset,
      ...presetAccess(kind, draft.preset === 'write' ? 'write' : 'read', giver),
      lifetime: kind === 'management' && draft.lifetime === null ? 90 : draft.lifetime,
    });

  return (
    <Form.Section title={t('kind-title', 'What is it for?')}>
      <ChoiceboxGroup
        direction="row"
        value={draft.kind}
        onValueChange={(value) => setKind(value === 'management' ? 'management' : 'regular')}
        className="flex-col sm:flex-row"
      >
        <ChoiceboxGroup.Item value="regular">
          <Choice
            title={t('regular', 'Regular key')}
            text={t(
              'regular-text',
              'Works with data: contacts, products, payments, files, automations, plugins.',
            )}
          />
        </ChoiceboxGroup.Item>
        <ChoiceboxGroup.Item value="management" disabled={!setupAllowed}>
          <Choice
            title={t('management', 'Management key')}
            text={
              setupAllowed
                ? t('management-text', 'Sets up the organisation. Never sees customers.')
                : t('management-owner', 'Only an owner or admin can make one.')
            }
          />
        </ChoiceboxGroup.Item>
      </ChoiceboxGroup>
    </Form.Section>
  );
};

/** Read only, read and write, or area by area and plugin by plugin. */
export const AccessSection = ({ draft, onChange }: DraftProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const giver = useGiver();

  const setPreset = (preset: Preset) =>
    onChange({
      ...draft,
      preset,
      ...(preset === 'custom' ? {} : presetAccess(draft.kind, preset, giver)),
    });

  return (
    <Form.Section title={t('access-title', 'What can it do?')}>
      <ChoiceboxGroup
        direction="row"
        value={draft.preset}
        onValueChange={(value) =>
          setPreset(value === 'write' || value === 'custom' ? value : 'read')
        }
        className="flex-col sm:flex-row"
      >
        <ChoiceboxGroup.Item value="read">
          <Choice
            title={t('read-only', 'Read only')}
            text={t('read-only-text', 'Looks, never changes.')}
          />
        </ChoiceboxGroup.Item>
        <ChoiceboxGroup.Item value="write">
          <Choice
            title={t('read-write', 'Read and write')}
            text={t('read-write-text', 'Looks and changes.')}
          />
        </ChoiceboxGroup.Item>
        <ChoiceboxGroup.Item value="custom">
          <Choice title={t('custom', 'Custom')} text={t('custom-text', 'Choose area by area.')} />
        </ChoiceboxGroup.Item>
      </ChoiceboxGroup>
      {draft.preset === 'custom' && isLimited(draft) && (
        <p className="text-xs text-muted-foreground">
          {t(
            'not-limited',
            'Payments, files, automations and plugins are off: this key sees only some contacts (see Limits).',
          )}
        </p>
      )}
      {draft.preset === 'custom' && (
        <>
          <div className="divide-y rounded-md border px-4">
            {areasOf(draft.kind).map((area) => (
              <AreaRow
                key={area}
                area={area}
                value={draft.areas[area]}
                limited={!fitsLimits(draft, area)}
                onChange={(access) =>
                  onChange({ ...draft, areas: { ...draft.areas, [area]: access } })
                }
              />
            ))}
          </div>
          <PluginRows draft={draft} onChange={onChange} />
        </>
      )}
    </Form.Section>
  );
};
