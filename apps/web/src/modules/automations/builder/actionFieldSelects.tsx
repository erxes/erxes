import type { ActionField, ActionInfo } from '@erxes/core-contract';
import { memberQueries, messageOf } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import {
  ConnectionPicker,
  LookupPicker,
  Select,
  textOf,
  useMemberOptions,
  useTagOptions,
} from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
  /** The step's other inputs (a value follows the field chosen in another). */
  input: Record<string, unknown>;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  subject: 'customer' | 'company';
  dataFields: FieldInfo[];
};

/** Where the record's own Data Extensions fields are, as conditions read them. */
const DATA_PREFIX = 'subject.data.';

/** A Data Extensions field's key from its path (`subject.data.plan` → `plan`). */
export const fieldKeyOf = (path: string) => path.slice(DATA_PREFIX.length);

/** The record's own Data Extensions fields among the paths a step can read. */
export const dataFieldsOf = (fields: FieldInfo[]) =>
  fields.filter((item) => item.path.startsWith(DATA_PREFIX));

export const asList = (value: unknown) =>
  Array.isArray(value) ? value.map(textOf) : value ? [textOf(value)] : [];

/** One of the record's Data Extensions fields, saved by key (`data_field`). */
export const DataFieldSelect = ({
  value,
  onChange,
  disabled,
  dataFields,
  subject,
}: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const fields = dataFieldsOf(dataFields);

  if (!fields.length) {
    return (
      <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
        {t('no-data-fields', 'No fields yet.')}{' '}
        <Link
          to={paths.settings.dataFieldsOf(`core.${subject}`)}
          className="text-primary-text hover:underline"
        >
          {t('add-in-data-model', 'Add one in the Data model')}
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
        {fields.map((item) => (
          <Select.Item key={item.path} value={fieldKeyOf(item.path)}>
            {item.label}
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
              <span className="flex items-center gap-2">
                <span className="truncate">{automation.name}</span>
                {automation.status !== 'active' && (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {t(`automation-status.${automation.status}`, automation.status)}
                  </span>
                )}
              </span>
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {chosen && chosen.status !== 'active' && (
        <p className="text-xs text-destructive-text">
          {t('chosen-automation-off', 'It is off: this step fails until you turn it on.')}
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
        <Select.Value placeholder={field.placeholder ?? t('choose', 'Choose…')} />
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

/** One of the action's integration's active connections, or none for its default one. */
export const ConnectionSelect = ({ action, value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');

  return (
    <ConnectionPicker
      integration={action.integration ?? undefined}
      value={textOf(value) || null}
      onValueChange={(connectionId) => onChange(connectionId ?? undefined)}
      noneLabel={t('default-connection', 'The default connection')}
      disabled={disabled}
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
