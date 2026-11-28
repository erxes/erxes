import type { AppliesTo, DataExtensionFieldGroup } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Input, MultipleSelector, type TFieldGroupLimit, Textarea } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSheet } from '~/components/FormSheet';
import { pluginDataFieldsTypes } from '~/modules/plugins/pluginDataFields';
import { usePluginText } from '~/modules/plugins/pluginText';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { useRefreshDataModel } from '../../dataQueries';
import { FormError } from '../../form/DraftEditor';
import { useDataErrorText } from '../../useDataErrors';
import { SettingRow } from '../SettingRow';

/** A code from a label: `Billing info` → `billing_info`; letters and digits kept. */
const codeOf = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]+/gu, '_')
    .replaceAll(/^_+|_+$/g, '')
    .replaceAll(/[^a-z0-9_]/g, '')
    .slice(0, 100) || 'group';

/** What a plugin type's groups can be limited to, from its UI (`dataFields.limits`). */
const useGroupLimits = (recordType: string) => {
  const { plugins } = usePlugins();
  const type = pluginDataFieldsTypes(plugins).find((entry) => entry.type === recordType);

  return { plugin: type?.plugin, limits: type?.dataFields.limits ?? [] };
};

/** One limit: the ids picked among the plugin's choices. */
const LimitField = ({
  plugin,
  limit,
  value,
  onChange,
}: {
  plugin: string;
  limit: TFieldGroupLimit;
  value: string[];
  onChange: (ids: string[]) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'groups' });
  const text = usePluginText();
  const choices = useQuery(limit.options);
  const options = choices.data ?? [];

  return (
    <SettingRow
      label={text(plugin, limit.label)}
      hint={choices.error ? messageOf(choices.error) : undefined}
    >
      <MultipleSelector
        value={value.map((id) => ({
          value: id,
          label: options.find((option) => option.value === id)?.label ?? id,
        }))}
        onChange={(picked) => onChange(picked.map((option) => option.value))}
        options={options}
        placeholder={t('applies-to-all', 'All')}
        hidePlaceholderWhenSelected
      />
    </SettingRow>
  );
};

/** "Shows on": the records of a plugin type a group is limited to; none picked: every record. */
const AppliesToFields = ({
  recordType,
  value,
  onChange,
}: {
  recordType: string;
  value: AppliesTo;
  onChange: (value: AppliesTo) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'groups' });
  const { plugin, limits } = useGroupLimits(recordType);

  if (!plugin || !limits.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">{t('applies-to', 'Shows on')}</p>
        <p className="text-xs text-muted-foreground">
          {t(
            'applies-to-hint',
            'Leave empty to show this group on every record. Otherwise a record must match each list.',
          )}
        </p>
      </div>
      {limits.map((limit) => (
        <LimitField
          key={limit.key}
          plugin={plugin}
          limit={limit}
          value={value[limit.key] ?? []}
          onChange={(ids) => onChange({ ...value, [limit.key]: ids })}
        />
      ))}
    </div>
  );
};

const GroupForm = ({
  recordType,
  group,
  onOpenChange,
}: {
  recordType: string;
  group?: DataExtensionFieldGroup;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'groups' });
  const ids = { label: useId(), code: useId(), description: useId() };
  const refresh = useRefreshDataModel();
  const errorText = useDataErrorText();
  const [label, setLabel] = useState(group?.label ?? '');
  const [code, setCode] = useState(group?.code ?? '');
  const [description, setDescription] = useState(group?.description ?? '');
  const [appliesTo, setAppliesTo] = useState<AppliesTo>(group?.appliesTo ?? {});
  const handlers = { onSuccess: () => void refresh().then(() => onOpenChange(false)) };
  const create = useMutation(orpc.dataFieldGroups.create.mutationOptions(handlers));
  const update = useMutation(orpc.dataFieldGroups.update.mutationOptions(handlers));
  const error = create.error ?? update.error;
  const limited = Object.keys(appliesTo).length ? { appliesTo } : {};

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title={group ? t('edit', 'Edit {{label}}', { label: group.label }) : t('add', 'Add group')}
      description={t('sheet-description', 'Fields show under their group on each record.')}
      submitting={create.isPending || update.isPending}
      onSubmit={(event) => {
        event.preventDefault();

        const body = { label, code: code.trim() || codeOf(label), ...limited };

        if (group) update.mutate({ id: group.id, ...body, description: description || null });
        else create.mutate({ recordType, ...body, description: description || undefined });
      }}
    >
      <FormError message={error ? errorText(error) : null} />
      <SettingRow label={t('label', 'Name')} htmlFor={ids.label}>
        <Input id={ids.label} value={label} required onChange={(e) => setLabel(e.target.value)} />
      </SettingRow>
      <SettingRow
        label={t('code', 'Code')}
        htmlFor={ids.code}
        hint={t('code-hint', 'For imports and integrations. Empty: made from the name.')}
      >
        <Input id={ids.code} value={code} onChange={(e) => setCode(e.target.value)} />
      </SettingRow>
      <SettingRow label={t('description', 'Description')} htmlFor={ids.description}>
        <Textarea
          id={ids.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </SettingRow>
      <AppliesToFields recordType={recordType} value={appliesTo} onChange={setAppliesTo} />
    </FormSheet>
  );
};

/** Adds a field group to a record type, or edits one: open while `open`. */
export const GroupSheet = ({
  recordType,
  group,
  open,
  onOpenChange,
}: {
  recordType: string;
  group?: DataExtensionFieldGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) =>
  open ? <GroupForm recordType={recordType} group={group} onOpenChange={onOpenChange} /> : null;
