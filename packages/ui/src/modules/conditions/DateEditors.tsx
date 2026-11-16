import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Combobox } from '../../components/combobox';
import { Command } from '../../components/command';
import { DatePicker } from '../../components/date-picker';
import { Select } from '../../components/select';
import { toIsoDay } from '../../lib/format';
import { oneOf, textOf } from '../../lib/text';
import { isRule, RELATIVE_UNITS, type RelativeAmount, type TConditionRule } from './conditions';
import { between, valuesBetween } from './filterRule';
import { useSpanText } from './filterText';
import { TypedInput } from './TypedInput';
import type { ValueEditorProps } from './ValueEditor';

const Span = z.object({ amount: z.number().optional(), unit: z.enum(RELATIVE_UNITS).optional() });

/** Relative dates in one pick, by operator; they stay current in a saved view. */
const PRESETS: Record<string, RelativeAmount[]> = {
  within_last: [
    { amount: 1, unit: 'days' },
    { amount: 7, unit: 'days' },
    { amount: 30, unit: 'days' },
    { amount: 90, unit: 'days' },
    { amount: 12, unit: 'months' },
  ],
  within_next: [
    { amount: 7, unit: 'days' },
    { amount: 30, unit: 'days' },
    { amount: 90, unit: 'days' },
  ],
  more_than_ago: [
    { amount: 30, unit: 'days' },
    { amount: 90, unit: 'days' },
    { amount: 12, unit: 'months' },
  ],
  anniversary_within: [
    { amount: 7, unit: 'days' },
    { amount: 30, unit: 'days' },
  ],
};

/** The amount and unit of a span, typed. */
const SpanInput = ({
  rule,
  onChange,
  onDone,
}: Omit<ValueEditorProps, 'rule' | 'field' | 'lookups'> & { rule: TConditionRule }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const current = Span.safeParse(rule.value).data ?? {};

  return (
    <div className="flex items-center gap-1.5 border-t p-2">
      <TypedInput
        type="number"
        min={0}
        className="h-8 w-20"
        aria-label={t('amount', 'Amount')}
        initial={textOf(current.amount)}
        onCommit={(text) =>
          onChange({
            ...rule,
            value: {
              unit: current.unit ?? 'days',
              amount: Math.max(0, Math.round(Number(text) || 0)),
            },
          })
        }
        onEnter={onDone}
      />
      {rule.op === 'anniversary_within' ? (
        <span className="text-sm text-muted-foreground">{t('units.days', 'days')}</span>
      ) : (
        <Select
          value={current.unit ?? 'days'}
          onValueChange={(next) => {
            const unit = oneOf(RELATIVE_UNITS, next);

            if (unit) onChange({ ...rule, value: { amount: current.amount ?? 0, unit } });
          }}
        >
          <Select.Trigger className="h-8 flex-1" aria-label={t('unit-label', 'Unit')}>
            <Select.Value>
              {t(`units.${current.unit ?? 'days'}`, current.unit ?? 'days')}
            </Select.Value>
          </Select.Trigger>
          <Select.Content>
            {RELATIVE_UNITS.map((unit) => (
              <Select.Item key={unit} value={unit}>
                {t(`units.${unit}`, unit)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )}
    </div>
  );
};

/** "In the last 30 days": the usual spans in one pick, or any amount and unit. */
export const RelativeEditor = (
  props: Omit<ValueEditorProps, 'rule' | 'field' | 'lookups'> & { rule: TConditionRule },
) => {
  const { rule, onChange, onDone } = props;
  const spanText = useSpanText();
  const current = Span.safeParse(rule.value).data ?? {};

  return (
    <div className="flex flex-col">
      <Command className="h-auto">
        <Command.List>
          {(PRESETS[rule.op] ?? []).map((span) => (
            <Command.Item
              key={`${span.amount}-${span.unit}`}
              value={`${span.amount}-${span.unit}`}
              onSelect={() => {
                onChange({ ...rule, value: span });
                onDone?.();
              }}
            >
              {spanText(span)}
              <Combobox.Check
                checked={current.amount === span.amount && current.unit === span.unit}
              />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
      <SpanInput {...props} />
    </div>
  );
};

const dayOf = (value: unknown) => {
  const text = textOf(value);

  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : undefined;
};

/** A day (before, on, after) or a range of days, on erxes-ui's date picker. */
export const DayEditor = ({ rule, onChange, onDone }: ValueEditorProps) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  if (isRule(rule)) {
    return (
      <DatePicker
        inline
        mode="single"
        value={dayOf(rule.value)}
        placeholder={t('pick-day', 'Pick a day')}
        clearable={false}
        onChange={(date) => {
          if (!(date instanceof Date)) return;

          onChange({ ...rule, value: toIsoDay(date) });
          onDone?.();
        }}
      />
    );
  }

  const [from, to] = valuesBetween(rule).map(dayOf);
  const path = rule.rules[0].path;

  return (
    <DatePicker
      inline
      mode="range"
      value={{ from, to }}
      clearable={false}
      onChange={(range) => {
        if (!range || range instanceof Date || Array.isArray(range)) return;

        const { from: start, to: end } = range satisfies DateRange;

        onChange(between(path, start && toIsoDay(start), end && toIsoDay(end)));

        if (start && end) onDone?.();
      }}
    />
  );
};
