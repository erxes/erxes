import type { ActionField } from '@erxes/core-contract';
import { MultipleSelector, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { textOf } from '~/lib/text';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';
import { useStageName } from '~/modules/leads/i18n';
import { useLeadStages } from '~/modules/leads/useLeads';
import { LookupError, useMemberOptions, useTagOptions } from './lookupOptions';
import type { FieldInfo } from './useAutomationFields';

export type ActionInputProps = {
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
        <Link to={CONTACT_SETTINGS.properties} className="text-primary-text hover:underline">
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
              <span className="size-2 shrink-0 rounded-full" style={{ background: stage.color }} />
              {stageName(stage.name)}
            </span>
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
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
  const members = useMemberOptions(isMembers);
  const tags = useTagOptions(subject, !isMembers);
  const { options, error } = isMembers ? members : tags;

  return (
    <>
      <MultipleSelector
        value={asList(value).map(
          (id) => options.find((option) => option.value === id) ?? { value: id, label: id },
        )}
        onChange={(next) => onChange(next.map((option) => option.value))}
        defaultOptions={options}
        options={options}
        disabled={disabled}
        placeholder={
          isMembers ? t('choose-members', 'Choose members…') : t('choose-tags', 'Choose tags…')
        }
        hidePlaceholderWhenSelected
      />
      <LookupError error={error} />
    </>
  );
};
