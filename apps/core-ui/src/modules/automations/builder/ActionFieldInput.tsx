import { IconAt, IconBuilding, IconUser } from '@tabler/icons-react';
import { Input, Select, Switch, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { textOf } from '~/lib/text';
import {
  type ActionInputProps,
  CustomFieldSelect,
  customFieldsOf,
  fieldIdOf,
  LeadStageSelect,
  LookupMultiSelect,
  OptionSelect,
} from './actionFieldSelects';
import { Segmented } from './Segmented';
import { TemplateInput } from './TemplateInput';

const TextField = ({
  field,
  value,
  onChange,
  disabled,
  subject,
  dataFields,
  multiline,
}: ActionInputProps & { multiline?: boolean }) => (
  <TemplateInput
    value={textOf(value)}
    onChange={onChange}
    fields={dataFields}
    subject={subject}
    multiline={multiline}
    placeholder={field.placeholder}
    disabled={disabled}
  />
);

const DateInput = ({ value, onChange, disabled }: ActionInputProps) => (
  <Input
    type="date"
    value={textOf(value)}
    disabled={disabled}
    onChange={(event) => onChange(event.target.value)}
  />
);

const CLEAR = '__clear';

/** A value for the custom field chosen in another input: shaped like that field. */
const ChosenFieldValue = (props: ActionInputProps & { fieldInput: string }) => {
  const { t } = useTranslation('automations');
  const { value, onChange, disabled, input, dataFields, fieldInput } = props;
  const chosen = customFieldsOf(dataFields).find(
    (item) => fieldIdOf(item.path) === input[fieldInput],
  );

  if (chosen?.type === 'date') return <DateInput {...props} />;

  const isBoolean = chosen?.type === 'boolean';

  const options = isBoolean
    ? [
        { value: 'true', label: t('yes', 'Yes') },
        { value: 'false', label: t('no', 'No') },
      ]
    : chosen?.type === 'select'
      ? (chosen.options ?? []).map((option) => ({ value: option, label: option }))
      : [];

  if (!options.length) return <TextField {...props} />;

  return (
    <Select
      value={value === undefined || value === '' ? CLEAR : textOf(value)}
      disabled={disabled}
      onValueChange={(next) => onChange(next === CLEAR ? '' : isBoolean ? next === 'true' : next)}
    >
      <Select.Trigger>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={CLEAR}>
          <span className="text-muted-foreground">{t('clear-value', 'Clear the field')}</span>
        </Select.Item>
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

/** `subject`: the record's own email; anything else (even empty, while typing): addresses. */
const RecipientsInput = (props: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const { value, onChange, disabled, subject } = props;
  const toRecord = value === undefined || value === 'subject';

  return (
    <div className="space-y-2">
      <Segmented
        value={toRecord ? 'record' : 'addresses'}
        disabled={disabled}
        onChange={(next) => onChange(next === 'record' ? 'subject' : '')}
        options={[
          {
            value: 'record',
            label:
              subject === 'company'
                ? t('to-company-email', "The company's email")
                : t('to-customer-email', "The customer's email"),
            icon: subject === 'company' ? IconBuilding : IconUser,
          },
          { value: 'addresses', label: t('to-addresses', 'Other addresses'), icon: IconAt },
        ]}
      />
      {!toRecord && (
        <TemplateInput
          value={textOf(value)}
          onChange={onChange}
          fields={props.dataFields}
          subject={subject}
          placeholder="name@example.com, other@example.com"
          disabled={disabled}
        />
      )}
    </div>
  );
};

/** Saved when it parses; until then the text stays and says it isn't JSON yet. */
const JsonInput = ({ field, value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const [invalid, setInvalid] = useState(false);

  return (
    <>
      <Textarea
        rows={4}
        className="font-mono text-xs"
        disabled={disabled}
        placeholder={field.placeholder}
        aria-invalid={invalid}
        defaultValue={value === undefined ? '' : JSON.stringify(value, null, 2)}
        onBlur={(event) => {
          const text = event.target.value.trim();

          try {
            onChange(text ? JSON.parse(text) : undefined);
            setInvalid(false);
          } catch {
            setInvalid(true);
          }
        }}
      />
      {invalid && (
        <p className="text-xs text-destructive">
          {t('invalid-json', 'Not valid JSON, not saved.')}
        </p>
      )}
    </>
  );
};

/** One input of an action, by its declared type. Text takes data from the run through "Insert data". */
export const ActionFieldInput = (props: ActionInputProps) => {
  const { field, value, onChange, disabled } = props;

  if (field.sameTypeAs) return <ChosenFieldValue {...props} fieldInput={field.sameTypeAs} />;

  switch (field.type) {
    case 'longtext':
      return <TextField {...props} multiline />;
    case 'date':
      return <DateInput {...props} />;
    case 'boolean':
      return <Switch checked={value === true} disabled={disabled} onCheckedChange={onChange} />;
    case 'recipients':
      return <RecipientsInput {...props} />;
    case 'custom_field':
      return <CustomFieldSelect {...props} />;
    case 'lead_stage':
      return <LeadStageSelect {...props} />;
    case 'select':
      return <OptionSelect {...props} />;
    case 'members':
    case 'tags':
      return <LookupMultiSelect {...props} />;
    case 'json':
      return <JsonInput {...props} />;
    default:
      return <TextField {...props} />;
  }
};
