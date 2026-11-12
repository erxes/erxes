import { Input, Select } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { oneOf } from '~/lib/text';
import { BuilderContext } from './BuilderContext';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { FieldLabel } from './FieldLabel';
import type { SettingsProps } from './stepSettingsProps';

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

export const DelaySettings = ({ step, disabled, onChange }: SettingsProps<'delay'>) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-1.5">
      <FieldLabel>{t('wait-for-how-long', 'Wait for')}</FieldLabel>
      <div className="flex items-center gap-2">
        <AmountInput
          value={step.amount ?? 1}
          disabled={disabled}
          onChange={(amount) => onChange({ ...step, amount, until: undefined })}
        />
        <Units
          value={step.unit ?? 'minutes'}
          disabled={disabled}
          onChange={(unit) => onChange({ ...step, unit })}
        />
      </div>
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
  const { events } = useContext(BuilderContext);

  return (
    <>
      <div className="space-y-1.5">
        <FieldLabel>{t('wait-for-event', 'Until this happens to the record')}</FieldLabel>
        <CatalogPicker
          kind="event"
          items={events}
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
          value={step.conditions}
          disabled={disabled}
          onChange={(conditions) => onChange({ ...step, conditions })}
        />
      </div>
      <p className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
        {t('wait-for-hint', 'Later steps can check whether it happened:')}{' '}
        <code>{`steps.${step.id}.output.matched`}</code>
      </p>
    </>
  );
};
