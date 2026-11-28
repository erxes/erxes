import type { ConditionGroup } from '@erxes/core-contract';
import { Input, Select, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { zoneLabel } from '~/lib/timeZones';
import { useSession } from '~/modules/auth/session';
import { ConditionsEditor } from './ConditionsEditor';
import { InfoTip } from './Field';

/** A time of day on the organisation's clock (Settings › General sets its zone). */
export const TimeOfDay = ({
  at,
  onChange,
  disabled,
}: {
  at: string;
  onChange: (at: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const zone = zoneLabel(useSession().organization.timezone);

  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        className="h-8 w-28 shrink-0"
        value={at}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-label={t('at', 'at')}
      />
      <span className="min-w-0 truncate text-xs text-muted-foreground">{zone}</span>
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
      <div className="flex items-center gap-1">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Switch
            checked={Boolean(value)}
            disabled={disabled}
            onCheckedChange={(on) => onChange(on ? { type: 'customer' } : undefined)}
          />
          {t('for-each-record', 'Run for each matching record')}
        </label>
        <InfoTip text={t('audience-hint', 'Up to 10,000 records a run; re-entry rules apply.')} />
      </div>
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
        </>
      )}
    </div>
  );
};
