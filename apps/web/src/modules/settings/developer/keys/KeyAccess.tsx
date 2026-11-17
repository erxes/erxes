import {
  IconAdjustmentsHorizontal,
  IconDatabase,
  IconEye,
  IconPencil,
  IconSettings,
} from '@tabler/icons-react';
import { ChoiceboxGroup, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSession } from '~/modules/auth/session';
import { AreaRow, PluginRows } from './AccessRows';
import {
  areasOf,
  isLimited,
  type KeyDraft,
  type KeyKind,
  type Preset,
  presetAccess,
} from './keyDraft';
import { Choice, type DraftProps } from './keyParts';
import { useGiver } from './useKeyPlugins';

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
            icon={IconDatabase}
            title={t('regular', 'Regular key')}
            text={t(
              'regular-text',
              'Works with data: contacts, products, payments, files, automations, plugins.',
            )}
          />
        </ChoiceboxGroup.Item>
        <ChoiceboxGroup.Item value="management" disabled={!setupAllowed}>
          <Choice
            icon={IconSettings}
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

  const setRows = (next: KeyDraft) => onChange({ ...next, preset: 'custom' });

  const setPreset = (preset: Preset) =>
    onChange({
      ...draft,
      preset,
      ...(preset === 'custom' ? {} : presetAccess(draft.kind, preset, giver)),
    });

  return (
    <Form.Section
      title={t('access-title', 'What can it do?')}
      description={t(
        'access-text',
        'Start from a preset, then change any area below. "Choose" picks single API calls.',
      )}
    >
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
            icon={IconEye}
            title={t('read-only', 'Read only')}
            text={t('read-only-text', 'Looks, never changes.')}
          />
        </ChoiceboxGroup.Item>
        <ChoiceboxGroup.Item value="write">
          <Choice
            icon={IconPencil}
            title={t('read-write', 'Read and write')}
            text={t('read-write-text', 'Looks and changes.')}
          />
        </ChoiceboxGroup.Item>
        <ChoiceboxGroup.Item value="custom">
          <Choice
            icon={IconAdjustmentsHorizontal}
            title={t('custom', 'Custom')}
            text={t('custom-text', 'Area by area, call by call.')}
          />
        </ChoiceboxGroup.Item>
      </ChoiceboxGroup>
      {isLimited(draft) && (
        <p className="text-xs text-muted-foreground">
          {t(
            'not-limited',
            'Payments, files, automations and plugins are off: this key sees only some contacts (see Limits).',
          )}
        </p>
      )}
      <div className="divide-y rounded-lg border px-4">
        {areasOf(draft.kind).map((area) => (
          <AreaRow key={area} area={area} draft={draft} onChange={setRows} />
        ))}
        <PluginRows draft={draft} onChange={setRows} />
      </div>
    </Form.Section>
  );
};
