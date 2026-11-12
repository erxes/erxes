import type { ConditionGroup } from '@erxes/core-contract';
import { Input, Select, Switch } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ConditionsEditor } from './ConditionsEditor';
import { zoneChoices, zoneLabel } from './timezones';

/** One labelled setting of the trigger. */
export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const TimeAndZone = ({
  at,
  timezone,
  onChange,
  disabled,
}: {
  at: string;
  timezone: string;
  onChange: (next: { at?: string; timezone?: string }) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        className="h-8 w-28 shrink-0"
        value={at}
        disabled={disabled}
        onChange={(event) => onChange({ at: event.target.value })}
        aria-label={t('at', 'at')}
      />
      <Select
        value={timezone}
        disabled={disabled}
        onValueChange={(value) => onChange({ timezone: value })}
      >
        <Select.Trigger className="h-8 min-w-0 flex-1">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {zoneChoices(timezone).map((zone) => (
            <Select.Item key={zone} value={zone}>
              {zoneLabel(zone)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

type Audience = { type: 'customer' | 'company'; conditions?: ConditionGroup };

/** Run once, or once for each customer or company matching the conditions. */
export const AudienceEditor = ({
  value,
  onChange,
  disabled,
}: {
  value: Audience | undefined;
  onChange: (next: Audience | undefined) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Switch
          checked={Boolean(value)}
          disabled={disabled}
          onCheckedChange={(on) => onChange(on ? { type: 'customer' } : undefined)}
        />
        {t('for-each-record', 'Run for each matching record')}
      </label>
      {value && (
        <>
          <Select
            value={value.type}
            disabled={disabled}
            onValueChange={(type) =>
              onChange({ type: type === 'company' ? 'company' : 'customer' })
            }
          >
            <Select.Trigger className="h-8 w-full">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="customer">{t('customers', 'Customers')}</Select.Item>
              <Select.Item value="company">{t('companies', 'Companies')}</Select.Item>
            </Select.Content>
          </Select>
          <ConditionsEditor
            subject={value.type}
            value={value.conditions}
            disabled={disabled}
            onChange={(conditions) => onChange({ ...value, conditions })}
          />
          <p className="text-xs text-muted-foreground">
            {t('audience-hint', 'Up to 10,000 records a run; re-entry rules apply.')}
          </p>
        </>
      )}
    </div>
  );
};
