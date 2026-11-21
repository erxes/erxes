import type { DataExtensionFieldSettings, DataExtensionFieldType } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { Label, LookupPicker } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { rolesQuery, useRoleText } from '~/modules/settings/roles/useRoles';
import { canBeUnique, isComputedType } from '../../fieldTypes';
import { SwitchRow } from '../SettingRow';
import type { SetSettings } from './fieldDraft';

/** The organisation's roles as picker options, by key. */
const useRoleOptions = () => {
  const roles = useQuery(rolesQuery());
  const roleText = useRoleText();

  return {
    options: (roles.data?.data ?? []).map((role) => ({
      value: role.key,
      label: roleText(role).name,
    })),
    loading: roles.isPending,
    error: roles.error,
  };
};

const RolesRow = ({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string[] | undefined;
  onChange: (roles: string[] | undefined) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'access' });
  const lookup = useRoleOptions();

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <LookupPicker
        lookup={lookup}
        value={value ?? []}
        multiple
        placeholder={t('everyone', 'Every role')}
        onValueChange={(roles) => onChange(roles.length ? roles : undefined)}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
};

/** Whether a record needs the field, keeps it unique, who changes it and who sees it. */
export const AccessSettings = ({
  type,
  settings,
  setSettings,
}: {
  type: DataExtensionFieldType;
  settings: DataExtensionFieldSettings;
  setSettings: SetSettings;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'access' });
  const computed = isComputedType(type);

  return (
    <div className="flex flex-col gap-3">
      {!computed && (
        <>
          <SwitchRow
            label={t('required', 'Required')}
            hint={t('required-hint', 'Create forms ask for it, and a value can’t be cleared.')}
            checked={Boolean(settings.required)}
            onCheckedChange={(required) => setSettings({ required: required || undefined })}
          />
          {canBeUnique(type) && (
            <SwitchRow
              label={t('unique', 'Unique')}
              hint={t('unique-hint', 'No two records share a value.')}
              checked={Boolean(settings.unique)}
              onCheckedChange={(unique) => setSettings({ unique: unique || undefined })}
            />
          )}
          <SwitchRow
            label={t('read-only', 'Read-only')}
            hint={t('read-only-hint', 'Only members who manage the data model change it.')}
            checked={Boolean(settings.readOnly)}
            onCheckedChange={(readOnly) => setSettings({ readOnly: readOnly || undefined })}
          />
          <SwitchRow
            label={t('show-in-create', 'Ask on create forms')}
            checked={settings.showInCreate !== false}
            onCheckedChange={(show) => setSettings({ showInCreate: show ? undefined : false })}
          />
        </>
      )}
      <RolesRow
        label={t('visible-to', 'Who sees it')}
        hint={t('visible-to-hint', 'Other roles don’t see its values, nor formulas that read it.')}
        value={settings.visibleTo}
        onChange={(visibleTo) => setSettings({ visibleTo })}
      />
      {!computed && (
        <RolesRow
          label={t('editable-by', 'Who changes it')}
          hint={t('editable-by-hint', 'Among those who see it. Empty: all of them.')}
          value={settings.editableBy}
          onChange={(editableBy) => setSettings({ editableBy })}
        />
      )}
    </div>
  );
};
