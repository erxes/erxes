import type { ActionField, ActionInfo } from '@erxes/core-contract';
import { memberQueries, messageOf } from '@erxes/core-contract/client';
import { skipToken, useQuery } from '@tanstack/react-query';
import {
  LookupPicker,
  pluginJson,
  Select,
  textOf,
  useMemberOptions,
  useTagOptions,
} from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { paths } from '~/lib/paths';
import { useStageName } from '~/modules/leads/i18n';
import { useLeadStages } from '~/modules/leads/useLeads';
import { tagsQuery } from '~/modules/tags/useTags';
import { automationsQuery } from '../automationQueries';
import { BuilderContext } from './BuilderContext';
import type { FieldInfo } from './useAutomationFields';

export type ActionInputProps = {
  /** The action the input belongs to: its plugin and its other inputs. */
  action: ActionInfo;
  field: ActionField;
  value: unknown;
  /** The step's other inputs (a value follows the custom field chosen in another). */
  input: Record<string, unknown>;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  subject: 'customer' | 'company';
  dataFields: FieldInfo[];
};

const CUSTOM_PREFIX = 'subject.customFields.';

export const fieldIdOf = (path: string) => path.replace(CUSTOM_PREFIX, '');

export const customFieldsOf = (fields: FieldInfo[]) =>
  fields.filter((item) => item.path.startsWith(CUSTOM_PREFIX));

const asList = (value: unknown) =>
  Array.isArray(value) ? value.map(textOf) : value ? [textOf(value)] : [];

export const CustomFieldSelect = ({ value, onChange, disabled, dataFields }: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const customFields = customFieldsOf(dataFields);

  if (!customFields.length) {
    return (
      <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
        {t('no-custom-fields', 'No custom fields yet.')}{' '}
        <Link to={paths.contacts.properties} className="text-primary-text hover:underline">
          {t('add-in-properties', 'Add one in Properties')}
        </Link>
      </p>
    );
  }

  return (
    <Select value={textOf(value)} disabled={disabled} onValueChange={onChange}>
      <Select.Trigger>
        <Select.Value placeholder={t('choose-field', 'Choose a field')} />
      </Select.Trigger>
      <Select.Content>
        {customFields.map((item) => (
          <Select.Item key={item.path} value={fieldIdOf(item.path)}>
            {item.label.replace(/ \(custom\)$/, '')}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

/** Saved by id; older steps saved the stage's name. */
export const LeadStageSelect = ({ value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const { stages } = useLeadStages();
  const stageName = useStageName();

  const current = stages.find(
    (stage) => stage.id === value || stage.name.toLowerCase() === textOf(value).toLowerCase(),
  );

  return (
    <Select value={current?.id ?? ''} disabled={disabled} onValueChange={onChange}>
      <Select.Trigger>
        <Select.Value placeholder={t('choose-stage', 'Choose a stage')} />
      </Select.Trigger>
      <Select.Content>
        {stages.map((stage) => (
          <Select.Item key={stage.id} value={stage.id}>
            <span className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-(--stage-color)"
                style={{ '--stage-color': stage.color }}
              />
              {stageName(stage.name)}
            </span>
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

export const AutomationSelect = ({ value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const { automationId } = useContext(BuilderContext);
  const automations = useQuery(automationsQuery());

  const startable = (automations.data?.data ?? [])
    .filter(
      (automation) =>
        automation.id !== automationId && automation.definition.trigger.kind === 'manual',
    )
    .toSorted((a, b) => Number(b.status === 'active') - Number(a.status === 'active'));

  if (automations.isError)
    return <p className="text-xs text-destructive-text">{messageOf(automations.error)}</p>;

  if (automations.isSuccess && !startable.length)
    return (
      <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
        {t(
          'no-startable-automations',
          'No other automation starts by hand yet. Make one with the Manual trigger.',
        )}
      </p>
    );

  const chosen = startable.find((automation) => automation.id === value);

  return (
    <div className="space-y-1.5">
      <Select value={textOf(value)} disabled={disabled} onValueChange={onChange}>
        <Select.Trigger>
          <Select.Value placeholder={t('choose-automation', 'Choose an automation')} />
        </Select.Trigger>
        <Select.Content>
          {startable.map((automation) => (
            <Select.Item
              key={automation.id}
              value={automation.id}
              disabled={automation.status !== 'active'}
            >
              <span className="truncate">{automation.name}</span>
              {automation.status !== 'active' && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {t(`automation-status.${automation.status}`, automation.status)}
                </span>
              )}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {chosen && chosen.status !== 'active' ? (
        <p className="text-xs text-destructive-text">
          {t('chosen-automation-off', 'It is off: this step fails until you turn it on.')}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('startable-hint', 'Automations with the Manual trigger that are on.')}
        </p>
      )}
    </div>
  );
};

export const OptionSelect = ({ field, value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');

  return (
    <Select value={textOf(value)} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger>
        <Select.Value placeholder={t('choose', 'Choose…')} />
      </Select.Trigger>
      <Select.Content>
        {(field.options ?? []).map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

const PluginRecords = z.array(z.object({ value: z.string(), label: z.string() }));

/**
 * The run's values that are records of this type (the trigger's task, a deal an earlier step
 * created), as picker options that insert them: "Task created: Task".
 */
const runRecordOptions = (
  dataFields: FieldInfo[],
  source: string,
  recordType: string | undefined,
) =>
  dataFields
    .filter((item) => recordType && item.recordType === recordType && item.source === source)
    .map((item) => ({
      value: `{{${item.path}}}`,
      label: item.groupLabel ? `${item.groupLabel}: ${item.label}` : item.label,
    }));

/**
 * The plugin's own records, listed by its API with the member's session, after the run's
 * records of that type. With `dependsOn`, the records under that input's value, once it has
 * one; with `multiple`, several.
 */
export const PluginRecordSelect = ({
  action,
  field,
  value,
  onChange,
  disabled = false,
  input,
  dataFields,
}: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const { recordType, dependsOn, multiple } = field;
  const parent = dependsOn === undefined ? '' : textOf(input[dependsOn]);
  const waiting = dependsOn !== undefined && !parent;
  // A parent taken from the run is known only when it runs: then only the run's records fit.
  // A chosen parent lists its own records: a run's record may sit under another one.
  const fromRun = parent.startsWith('{{');
  const listed = Boolean(recordType) && !waiting && !fromRun;
  const query = new URLSearchParams(parent ? { parent } : {});

  const records = useQuery({
    queryKey: ['plugin-records', action.source, recordType, parent],
    queryFn:
      recordType && listed
        ? () =>
            pluginJson(action.source, `/automations/records/${recordType}?${query}`, PluginRecords)
        : skipToken,
  });

  const parentLabel = action.fields.find((other) => other.key === dependsOn)?.label;

  return (
    <LookupPicker
      multiple={multiple}
      lookup={{
        options: [
          ...(fromRun || dependsOn === undefined
            ? runRecordOptions(dataFields, action.source, recordType)
            : []),
          ...(listed ? (records.data ?? []) : []),
        ],
        loading: listed && records.isPending,
        error: records.error,
      }}
      value={asList(value)}
      onValueChange={(ids) => onChange(multiple ? ids : ids[0])}
      disabled={disabled || waiting}
      placeholder={
        waiting
          ? t('choose-parent-first', 'Choose {{field}} first', { field: parentLabel })
          : t('choose', 'Choose…')
      }
    />
  );
};

/** Team members or tags of the subject, several at once. */
export const LookupMultiSelect = ({
  field,
  value,
  onChange,
  disabled,
  subject,
}: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const isMembers = field.type === 'members';
  const picked = asList(value);
  const members = useMemberOptions(memberQueries, isMembers, picked);
  const tags = useTagOptions(tagsQuery(subject), !isMembers);

  return (
    <LookupPicker
      multiple
      lookup={isMembers ? members : tags}
      value={picked}
      onValueChange={onChange}
      disabled={disabled}
      placeholder={
        isMembers ? t('choose-members', 'Choose members…') : t('choose-tags', 'Choose tags…')
      }
    />
  );
};
