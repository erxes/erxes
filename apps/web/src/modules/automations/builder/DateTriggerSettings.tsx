import type { AutomationTrigger } from '@erxes/core-contract';
import {
  IconBuilding,
  IconCalendarEvent,
  IconRepeat,
  IconRepeatOnce,
  IconUser,
} from '@tabler/icons-react';
import { Input, Select, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { paths } from '~/lib/paths';
import { ConditionsEditor } from './ConditionsEditor';
import { Segmented } from './Segmented';
import { zoneLabel } from './timezones';
import { Field, TimeAndZone } from './triggerFields';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';

type DateTrigger = Extract<AutomationTrigger, { kind: 'date' }>;

type Props = {
  trigger: DateTrigger;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
};

/** The trigger's `field` for a date field: `birthDate`, or a custom field's id. */
const dateFieldKey = (path: string) =>
  path === 'subject.birthDate' ? 'birthDate' : path.replace('subject.customFields.', '');

const plainLabel = (field: FieldInfo) => field.label.replace(/ \(custom\)$/, '');

/** Mid-sentence: "birthday", but "VIP date" stays as it is. */
const midSentence = (label: string) =>
  /^.[a-zа-яөү]/.test(label) ? label.charAt(0).toLowerCase() + label.slice(1) : label;

const whenOf = (offsetDays: number) =>
  offsetDays > 0 ? 'after' : offsetDays < 0 ? 'before' : 'on';

const RecordsField = ({ trigger, onChange, disabled }: Props) => {
  const { t } = useTranslation('automations');

  return (
    <Field label={t('date-records', 'Records')}>
      <Segmented
        value={trigger.subject}
        disabled={disabled}
        onChange={(subject) =>
          onChange({
            ...trigger,
            subject,
            field: subject === 'customer' ? 'birthDate' : '',
            conditions: undefined,
          })
        }
        options={[
          { value: 'customer', label: t('customers', 'Customers'), icon: IconUser },
          { value: 'company', label: t('companies', 'Companies'), icon: IconBuilding },
        ]}
      />
    </Field>
  );
};

const DateFieldSelect = ({
  trigger,
  onChange,
  disabled,
  dateFields,
  known,
}: Props & { dateFields: FieldInfo[]; known: boolean }) => {
  const { t } = useTranslation('automations');

  if (!dateFields.length) {
    return (
      <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
        {trigger.subject === 'company'
          ? t('no-company-dates', 'Companies have no date fields yet.')
          : t('no-customer-dates', 'Customers have no date fields yet.')}{' '}
        <Link to={paths.contacts.properties} className="text-primary-text hover:underline">
          {t('add-date-property', 'Add a date property')}
        </Link>
      </p>
    );
  }

  return (
    <Select
      value={known ? trigger.field : ''}
      disabled={disabled}
      onValueChange={(field) => onChange({ ...trigger, field })}
    >
      <Select.Trigger className="h-8 w-full">
        <Select.Value placeholder={t('choose-date-field', 'Choose a date')} />
      </Select.Trigger>
      <Select.Content>
        {dateFields.map((field) => (
          <Select.Item key={field.path} value={dateFieldKey(field.path)}>
            {plainLabel(field)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

/** Before, on or after the date, and by how many days (1 to 365). */
const WhenField = ({ trigger, onChange, disabled, fieldName }: Props & { fieldName: string }) => {
  const { t } = useTranslation('automations');
  const when = whenOf(trigger.offsetDays);
  const days = Math.abs(trigger.offsetDays);

  const setDays = (next: number, direction = when) => {
    const sign = direction === 'before' ? -1 : 1;
    const offset = Math.min(365, Math.max(1, Math.round(next) || 1));

    onChange({ ...trigger, offsetDays: direction === 'on' ? 0 : sign * offset });
  };

  return (
    <Field label={t('when', 'When')}>
      <Segmented
        value={when}
        disabled={disabled}
        onChange={(next) => setDays(Math.max(1, days), next)}
        options={[
          { value: 'before', label: t('when-before', 'Before') },
          { value: 'on', label: t('on-the-day', 'On the day') },
          { value: 'after', label: t('when-after', 'After') },
        ]}
      />
      {when !== 'on' && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="number"
            min={1}
            max={365}
            className="h-8 w-20 shrink-0"
            value={days}
            disabled={disabled}
            onChange={(event) => setDays(Number(event.target.value))}
            aria-label={t('days', 'days')}
          />
          <span className="text-sm text-muted-foreground">
            {t(when === 'before' ? 'days-before-the' : 'days-after-the', {
              count: days,
              field: fieldName,
              defaultValue:
                when === 'before' ? 'days before the {{field}}' : 'days after the {{field}}',
            })}
          </span>
        </div>
      )}
    </Field>
  );
};

/** The whole rule in a sentence, with an example: a date five weeks from now and its run. */
const DateSummary = ({ trigger, fieldName }: { trigger: DateTrigger; fieldName: string }) => {
  const { t } = useTranslation('automations');
  const fmt = useFormat();
  const now = useMinuteClock();
  const when = whenOf(trigger.offsetDays);
  const sample = new Date(now);

  sample.setDate(sample.getDate() + 35);

  const runDay = new Date(sample);

  runDay.setDate(runDay.getDate() + trigger.offsetDays);

  const dayText = (date: Date) => fmt.date(date, trigger.yearly ? 'MMMM d' : 'PPP');

  const relation =
    when === 'on'
      ? t('date-on-the-day', 'on the day of')
      : t(when === 'before' ? 'date-days-before' : 'date-days-after', {
          count: Math.abs(trigger.offsetDays),
          defaultValue: when === 'before' ? '{{count}} days before' : '{{count}} days after',
        });

  const record =
    trigger.subject === 'company'
      ? t('each-company', 'each company')
      : t('each-customer', 'each customer');

  return (
    <div className="flex gap-2.5 rounded-lg bg-primary/5 p-3 text-sm">
      <IconCalendarEvent className="mt-0.5 size-4 shrink-0 text-primary-text" />
      <div className="min-w-0 space-y-1">
        <p>
          {t('date-summary', {
            relation,
            record,
            field: fieldName,
            time: trigger.at,
            zone: zoneLabel(trigger.timezone),
            defaultValue: 'Runs {{relation}} {{record}}’s {{field}}, at {{time}} ({{zone}}).',
          })}{' '}
          {trigger.yearly
            ? t('date-summary-yearly', 'Every year.')
            : t('date-summary-once', 'Once.')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('date-example', {
            field: fieldName,
            date: dayText(sample),
            run: dayText(runDay),
            time: trigger.at,
            defaultValue: 'For example: {{field}} {{date}} → runs {{run}} at {{time}}.',
          })}
        </p>
      </div>
    </div>
  );
};

/**
 * "N days before / on / after each record's <date>": which records, which date, when
 * relative to it, once or every year, at what time, and the whole rule in a sentence.
 */
export const DateTriggerSettings = (props: Props) => {
  const { t } = useTranslation('automations');
  const { trigger, onChange, disabled } = props;

  const dateFields = useAutomationFields(trigger.subject).fields.filter(
    (field) => field.type === 'date' && field.path !== 'subject.createdAt',
  );

  const current = dateFields.find((field) => dateFieldKey(field.path) === trigger.field);
  const fieldName = current ? midSentence(plainLabel(current)) : t('the-date', 'the date');

  return (
    <>
      <RecordsField {...props} />
      <Field label={t('date-field', 'Date')}>
        <DateFieldSelect {...props} dateFields={dateFields} known={Boolean(current)} />
      </Field>
      <WhenField {...props} fieldName={fieldName} />
      <Field
        label={t('repeat', 'Repeat')}
        hint={
          trigger.yearly
            ? t('yearly-hint', 'Birthdays and anniversaries: the year of the date is ignored.')
            : t('once-hint', 'Renewals, due dates, trial ends: runs once for each date.')
        }
      >
        <Segmented
          value={trigger.yearly ? 'yearly' : 'once'}
          disabled={disabled}
          onChange={(next) => onChange({ ...trigger, yearly: next === 'yearly' })}
          options={[
            { value: 'yearly', label: t('every-year', 'Every year'), icon: IconRepeat },
            { value: 'once', label: t('once', 'Once'), icon: IconRepeatOnce },
          ]}
        />
      </Field>
      <Field label={t('time', 'Time')}>
        <TimeAndZone
          at={trigger.at}
          timezone={trigger.timezone}
          disabled={disabled}
          onChange={(next) => onChange({ ...trigger, ...next })}
        />
      </Field>
      <DateSummary trigger={trigger} fieldName={fieldName} />
      <Field label={t('only-if', 'Only if')}>
        <ConditionsEditor
          subject={trigger.subject}
          value={trigger.conditions}
          disabled={disabled}
          onChange={(conditions) => onChange({ ...trigger, conditions })}
        />
      </Field>
    </>
  );
};
