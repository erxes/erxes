import { isAppEvent } from '@erxes/core-contract';
import { Input, oneOf, Select } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './BuilderContext';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { FieldLabel } from './FieldLabel';
import { eventDataFields } from './flowChecks';
import { Segmented } from './Segmented';
import type { SettingsProps } from './stepSettingsProps';
import { useAutomationFields } from './useAutomationFields';

const UNITS = ['minutes', 'hours', 'days'] as const;

const Units = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (unit: (typeof UNITS)[number]) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        const unit = oneOf(UNITS, next);

        if (unit) onChange(unit);
      }}
    >
      <Select.Trigger className="w-32">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {UNITS.map((unit) => (
          <Select.Item key={unit} value={unit}>
            {t(unit, unit)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

const AmountInput = ({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (amount: number) => void;
}) => (
  <Input
    className="w-24"
    type="number"
    min={1}
    disabled={disabled}
    value={value}
    onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
  />
);

const UNTIL = /^\{\{\s*([^{}|]+?)\s*\}\}$/;

const UntilDate = ({ step, subject, disabled, onChange }: SettingsProps<'delay'>) => {
  const { t } = useTranslation('automations');
  const { automationId, hasSubject, outputsBefore } = useContext(BuilderContext);
  const { fields } = useAutomationFields(hasSubject ? subject : null, automationId);

  const dates = [...fields, ...outputsBefore(step.id)].filter(
    (field) => field.type === 'date' && !field.conditionsOnly,
  );

  const path = UNTIL.exec(step.until ?? '')?.[1];

  return (
    <Select
      value={path ?? ''}
      disabled={disabled}
      onValueChange={(next) => next && onChange({ ...step, until: `{{${next}}}` })}
    >
      <Select.Trigger aria-label={t('wait-until-date', 'Until the date in')}>
        <Select.Value placeholder={t('choose-date-field', 'Choose a date')} />
      </Select.Trigger>
      <Select.Content>
        {dates.map((field) => (
          <Select.Item key={field.path} value={field.path}>
            {field.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

export const DelaySettings = (props: SettingsProps<'delay'>) => {
  const { t } = useTranslation('automations');
  const { step, disabled, onChange } = props;
  const until = step.until !== undefined;

  return (
    <div className="space-y-1.5">
      <FieldLabel>{t('wait-for-how-long', 'Wait')}</FieldLabel>
      <Segmented
        value={until ? 'until' : 'for'}
        disabled={disabled}
        label={t('wait-for-how-long', 'Wait')}
        onChange={(next) =>
          onChange(
            next === 'until'
              ? { ...step, until: '' }
              : { ...step, until: undefined, amount: step.amount ?? 1 },
          )
        }
        options={[
          { value: 'for', label: t('wait-a-while', 'For a while') },
          { value: 'until', label: t('wait-until', 'Until a date') },
        ]}
      />
      {until ? (
        <UntilDate {...props} />
      ) : (
        <div className="flex items-center gap-2">
          <AmountInput
            value={step.amount ?? 1}
            disabled={disabled}
            onChange={(amount) => onChange({ ...step, amount })}
          />
          <Units
            value={step.unit ?? 'minutes'}
            disabled={disabled}
            onChange={(unit) => onChange({ ...step, unit })}
          />
        </div>
      )}
    </div>
  );
};

export const WaitForSettings = ({
  step,
  subject,
  disabled,
  onChange,
}: SettingsProps<'wait_for'>) => {
  const { t } = useTranslation('automations');
  const { events, knownEvents } = useContext(BuilderContext);

  return (
    <>
      <div className="space-y-1.5">
        <FieldLabel>{t('wait-for-event', 'Until this happens to the record')}</FieldLabel>
        <CatalogPicker
          kind="event"
          items={events.map((event) => ({ ...event, comingSoon: isAppEvent(event.type) }))}
          value={step.event}
          disabled={disabled}
          onChange={(event) => onChange({ ...step, event })}
        />
      </div>
      <div className="space-y-1.5">
        <FieldLabel>{t('at-most', 'For at most')}</FieldLabel>
        <div className="flex items-center gap-2">
          <AmountInput
            value={step.amount}
            disabled={disabled}
            onChange={(amount) => onChange({ ...step, amount })}
          />
          <Units
            value={step.unit}
            disabled={disabled}
            onChange={(unit) => onChange({ ...step, unit })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <FieldLabel>{t('only-if', 'Only if')}</FieldLabel>
        <ConditionsEditor
          subject={subject}
          extraFields={eventDataFields(knownEvents.find((event) => event.type === step.event))}
          value={step.conditions}
          disabled={disabled}
          onChange={(conditions) => onChange({ ...step, conditions })}
        />
      </div>
    </>
  );
};
