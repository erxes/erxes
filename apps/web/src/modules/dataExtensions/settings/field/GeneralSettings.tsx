import { Input, Select } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypeLabel } from '../../dataQueries';
import { FIELD_TYPE_LIST, FIELD_TYPES, isFieldType } from '../../fieldTypes';
import { IconRow, KeyAndDescription, SettingRow } from '../SettingRow';
import { type FieldDraft, keyOfLabel, type SetDraft, type SetSettings } from './fieldDraft';

/** Every type but relation, which "Add relation" makes. */
const SHEET_TYPES = FIELD_TYPE_LIST.filter((type) => type !== 'relation');

const TypePicker = ({
  draft,
  set,
  creating,
}: {
  draft: FieldDraft;
  set: SetDraft;
  creating: boolean;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });
  const id = useId();
  const typeLabel = useTypeLabel();

  return (
    <SettingRow
      label={t('type', 'Type')}
      htmlFor={id}
      hint={
        creating
          ? undefined
          : t('type-hint', 'Convert type changes it and carries its values over.')
      }
    >
      <Select
        value={draft.type}
        disabled={!creating}
        onValueChange={(type) => {
          if (isFieldType(type)) set({ type, options: [], settings: {} });
        }}
      >
        <Select.Trigger id={id} variant="bordered">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {SHEET_TYPES.map((type) => {
            const TypeIcon = FIELD_TYPES[type].icon;

            return (
              <Select.Item key={type} value={type}>
                <span className="flex items-center gap-2">
                  <TypeIcon className="size-4 text-muted-foreground" />
                  {typeLabel(type)}
                </span>
              </Select.Item>
            );
          })}
        </Select.Content>
      </Select>
    </SettingRow>
  );
};

/** Type, icon, label, key and description; then the group and placeholder forms show. */
export const GeneralSettings = ({
  draft,
  set,
  setSettings,
  creating,
}: {
  draft: FieldDraft;
  set: SetDraft;
  setSettings: SetSettings;
  creating: boolean;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });

  const ids = { label: useId(), group: useId(), placeholder: useId() };

  return (
    <>
      <TypePicker draft={draft} set={set} creating={creating} />
      <IconRow icon={draft.icon} onIconChange={(icon) => set({ icon })}>
        <SettingRow label={t('label', 'Label')} htmlFor={ids.label}>
          <Input
            id={ids.label}
            value={draft.label}
            onChange={({ target }) =>
              set({ label: target.value, ...(creating ? { key: keyOfLabel(target.value) } : {}) })
            }
          />
        </SettingRow>
      </IconRow>
      <KeyAndDescription
        keyValue={draft.key}
        keyHint={t(
          'key-hint',
          'camelCase: the name its value has in the API, formulas and imports.',
        )}
        description={draft.description}
        onKeyChange={(key) => set({ key })}
        onDescriptionChange={(description) => set({ description })}
      />
      <div className="flex gap-3">
        <SettingRow label={t('group', 'Group')} htmlFor={ids.group}>
          <Input
            id={ids.group}
            value={draft.settings.group ?? ''}
            placeholder={t('group-placeholder', 'Shown under this heading')}
            onChange={({ target }) => setSettings({ group: target.value || undefined })}
          />
        </SettingRow>
        <SettingRow label={t('placeholder', 'Placeholder')} htmlFor={ids.placeholder}>
          <Input
            id={ids.placeholder}
            value={draft.settings.placeholder ?? ''}
            onChange={({ target }) => setSettings({ placeholder: target.value || undefined })}
          />
        </SettingRow>
      </div>
    </>
  );
};
