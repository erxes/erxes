import { type ConditionRule, RelativeAmount } from '@erxes/core-contract';
import { Input, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { amountStep, fromAmountInput, toAmountInput } from '~/lib/money';
import { oneOf, textOf } from '~/lib/text';
import { LIST_VALUE, RELATIVE } from './conditionOperators';
import { LookupError, useMemberOptions, useTagOptions } from './lookupOptions';
import type { FieldInfo } from './useAutomationFields';

const RELATIVE_UNITS = RelativeAmount.shape.unit.unwrap().options;

/** What the rule holds so far: a half-typed amount is still shown. */
const RelativeValue = z.object({
  amount: z.number().optional(),
  unit: z.enum(RELATIVE_UNITS).optional(),
});

type ValueProps = {
  rule: ConditionRule;
  field?: FieldInfo;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  subject: 'customer' | 'company' | null;
};

const RelativeInput = ({ rule, onChange, disabled }: ValueProps) => {
  const { t } = useTranslation('automations');
  // A value from another operator (a list, a date) starts the relative input empty.
  const current = RelativeValue.safeParse(rule.value).data ?? {};

  return (
    <div className="flex w-full items-center gap-1">
      <Input
        className="h-8 w-20"
        type="number"
        min={0}
        disabled={disabled}
        value={current.amount ?? ''}
        onChange={(event) =>
          onChange({
            unit: 'days',
            ...current,
            amount: Math.max(0, Number(event.target.value) || 0),
          })
        }
      />
      {rule.op === 'anniversary_within' ? (
        <span className="text-sm text-muted-foreground">{t('days', 'days')}</span>
      ) : (
        <Select
          value={current.unit ?? 'days'}
          disabled={disabled}
          onValueChange={(next) => {
            const unit = oneOf(RELATIVE_UNITS, next);

            if (unit) onChange({ amount: 0, ...current, unit });
          }}
        >
          <Select.Trigger className="h-8 w-28 shrink-0">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {RELATIVE_UNITS.map((unit) => (
              <Select.Item key={unit} value={unit}>
                {t(unit, unit)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )}
    </div>
  );
};

/** A team member ("me" first) or a tag of the subject. */
const LookupInput = ({ rule, field, onChange, disabled, subject }: ValueProps) => {
  const { t } = useTranslation('automations');
  const isMember = field?.type === 'member';
  const members = useMemberOptions(isMember);
  const tags = useTagOptions(subject ?? 'customer', !isMember);
  const { options: loaded, error } = isMember ? members : tags;
  const options = isMember ? [{ value: 'me', label: t('me', 'Me') }, ...loaded] : loaded;

  return (
    <Select value={textOf(rule.value)} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger className="h-8 w-full min-w-0">
        <Select.Value placeholder={t('choose', 'Choose…')} />
      </Select.Trigger>
      <Select.Content>
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
        <LookupError error={error} />
      </Select.Content>
    </Select>
  );
};

const ListInput = ({ rule, onChange, disabled }: ValueProps) => {
  const { t } = useTranslation('automations');

  return (
    <Input
      className="h-8 w-full min-w-0"
      disabled={disabled}
      placeholder={t('list-placeholder', 'a, b, c')}
      value={Array.isArray(rule.value) ? rule.value.join(', ') : textOf(rule.value)}
      onChange={(event) =>
        onChange(
          event.target.value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }
    />
  );
};

const BooleanInput = ({ rule, onChange, disabled }: ValueProps) => {
  const { t } = useTranslation('automations');

  return (
    <Select
      value={textOf(rule.value ?? 'true')}
      onValueChange={(value) => onChange(value === 'true')}
      disabled={disabled}
    >
      <Select.Trigger className="h-8 w-28 shrink-0">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="true">{t('yes', 'yes')}</Select.Item>
        <Select.Item value="false">{t('no', 'no')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

const OptionInput = ({ rule, options, onChange, disabled }: ValueProps & { options: string[] }) => (
  <Select value={textOf(rule.value)} onValueChange={onChange} disabled={disabled}>
    <Select.Trigger className="h-8 w-full min-w-0">
      <Select.Value />
    </Select.Trigger>
    <Select.Content>
      {options.map((option) => (
        <Select.Item key={option} value={option}>
          {option}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);

const TextInput = ({ rule, field, onChange, disabled }: ValueProps) => {
  const { t } = useTranslation('automations');

  return (
    <Input
      className="h-8 w-full min-w-0"
      type={field?.type === 'date' ? 'date' : field?.type === 'number' ? 'number' : 'text'}
      disabled={disabled}
      placeholder={t('value-placeholder', 'value')}
      value={textOf(rule.value)}
      onChange={(event) =>
        onChange(field?.type === 'number' ? Number(event.target.value) : event.target.value)
      }
    />
  );
};

/** An amount typed in the currency's major unit (12.50), kept in its smallest (1250); the text is kept while typing. */
const MoneyInput = ({ rule, onChange, disabled, currency }: ValueProps & { currency: string }) => {
  const { t } = useTranslation('automations');
  const stored = Number(rule.value);

  const [text, setText] = useState(
    rule.value === undefined || !Number.isFinite(stored) ? '' : toAmountInput(stored, currency),
  );

  return (
    <Input
      className="h-8 w-full min-w-0"
      type="number"
      step={amountStep(currency)}
      disabled={disabled}
      placeholder={t('value-placeholder', 'value')}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(fromAmountInput(event.target.value, currency));
      }}
    />
  );
};

/** The value side of a rule, shaped by the operator and the field's type. */
export const ConditionValueInput = (props: ValueProps) => {
  const { rule, field } = props;

  if (RELATIVE.has(rule.op)) return <RelativeInput {...props} />;

  if (field?.currency && field.type === 'number' && !LIST_VALUE.has(rule.op)) {
    return <MoneyInput {...props} currency={field.currency} />;
  }

  if (LIST_VALUE.has(rule.op)) return <ListInput {...props} />;

  if (field?.type === 'member' || field?.type === 'tags') return <LookupInput {...props} />;

  if (field?.type === 'boolean') return <BooleanInput {...props} />;

  if (field?.options?.length) return <OptionInput {...props} options={field.options} />;

  return <TextInput {...props} />;
};
