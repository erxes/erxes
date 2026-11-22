import { IconAt, IconBuilding, IconCalendar, IconClockPlus, IconUser } from '@tabler/icons-react';
import {
  ConnectionPicker,
  DatePicker,
  InputGroup,
  Select,
  Switch,
  textOf,
  toIsoDay,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ReplyToSelect } from '~/components/ReplyToSelect';
import {
  type ActionInputProps,
  AutomationSelect,
  CustomFieldSelect,
  customFieldsOf,
  fieldIdOf,
  LeadStageSelect,
  LookupMultiSelect,
  OptionSelect,
  PluginRecordSelect,
} from './actionFieldSelects';
import { JsonEditor } from './JsonEditor';
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
    label={field.label}
    value={textOf(value)}
    onChange={onChange}
    fields={dataFields}
    subject={subject}
    multiline={multiline}
    placeholder={field.placeholder}
    disabled={disabled}
  />
);

/** `{{now | add_days: 7 | date}}`: the day, a number of days after the step runs. */
const AFTER_RUN = /^\{\{\s*now\s*\|\s*add_days:\s*(\d+)\s*\|\s*date\s*\}\}$/;

const afterRun = (days: number) => `{{now | add_days: ${days} | date}}`;

/** A fixed day, or (what an automation usually wants) some days after the step runs. */
const DateInput = ({ field, value, onChange, disabled }: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const text = textOf(value);
  const days = AFTER_RUN.exec(text)?.[1];

  return (
    <div className="space-y-2">
      <Segmented
        value={days === undefined ? 'on' : 'after'}
        disabled={disabled}
        label={field.label}
        onChange={(next) => onChange(next === 'after' ? afterRun(7) : '')}
        options={[
          { value: 'on', label: t('on-a-date', 'On a date'), icon: IconCalendar },
          { value: 'after', label: t('days-after-run', 'Days after it runs'), icon: IconClockPlus },
        ]}
      />
      {days === undefined ? (
        <DatePicker
          value={text || undefined}
          placeholder={t('choose-date', 'Choose a date')}
          onChange={(date) => onChange(date instanceof Date ? toIsoDay(date) : '')}
        />
      ) : (
        <InputGroup>
          <InputGroup.Input
            type="number"
            min={0}
            max={3650}
            value={days}
            disabled={disabled}
            aria-label={t('days-after-run', 'Days after it runs')}
            onChange={(event) =>
              onChange(
                afterRun(Math.min(3650, Math.max(0, Math.trunc(Number(event.target.value))))),
              )
            }
          />
          <InputGroup.Addon align="end">{t('days-later', 'days later')}</InputGroup.Addon>
        </InputGroup>
      )}
    </div>
  );
};

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
          label={t('to-addresses', 'Other addresses')}
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

const JsonInput = ({ field, value, onChange, disabled, subject, dataFields }: ActionInputProps) => (
  <JsonEditor
    label={field.label}
    value={value}
    fields={dataFields}
    subject={subject}
    disabled={disabled}
    flat={field.type === 'key_values'}
    onChange={onChange}
  />
);

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
    case 'plugin_record':
      return <PluginRecordSelect {...props} />;
    case 'automation':
      return <AutomationSelect {...props} />;
    case 'select':
      return <OptionSelect {...props} />;
    case 'members':
    case 'tags':
      return <LookupMultiSelect {...props} />;
    case 'json':
    case 'key_values':
      return <JsonInput {...props} />;
    case 'connection':
      return (
        <ConnectionPicker
          integration={field.integration}
          value={typeof value === 'string' && value ? value : null}
          onValueChange={(next) => onChange(next ?? undefined)}
        />
      );
    case 'reply_to':
      return (
        <ReplyToSelect
          value={typeof value === 'string' ? value : null}
          onChange={(next) => onChange(next ?? undefined)}
          disabled={disabled}
        />
      );
    default:
      return <TextField {...props} />;
  }
};
