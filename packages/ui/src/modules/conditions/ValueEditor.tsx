import { useTranslation } from 'react-i18next';
import { Combobox } from '../../components/combobox';
import { Command } from '../../components/command';
import { amountStep, fromAmountInput, toAmountInput } from '../../lib/money';
import { textOf } from '../../lib/text';
import { EntityPicker } from '../pickers/EntityPicker';
import {
  isRule,
  LIST_VALUE,
  NO_VALUE,
  RELATIVE,
  type TConditionField,
  type TConditionLookups,
  type TConditionRule,
} from './conditions';
import { between, type TFilterRule, valuesBetween } from './filterRule';
import { DayEditor, RelativeEditor } from './DateEditors';
import { useFieldOptions } from './fieldOptions';
import { valuesOf } from './filterText';
import { TypedInput } from './TypedInput';

export type ValueEditorProps = {
  rule: TFilterRule;
  field: TConditionField | undefined;
  lookups: TConditionLookups;
  onChange: (next: TFilterRule) => void;
  /** A pick that finishes the rule (a day, yes or no, Enter): a popover around the editor closes. */
  onDone?: () => void;
};

type RuleEditorProps = Omit<ValueEditorProps, 'rule'> & { rule: TConditionRule };

/** Options (a choice, members, tags) by their labels: "is any of" picks several, others one. */
const OptionsEditor = ({ rule, field, lookups, onChange, onDone }: RuleEditorProps) => {
  const picked = valuesOf(rule);
  const { options, loading, error } = useFieldOptions(field, lookups, picked);
  const multiple = LIST_VALUE.has(rule.op);

  return (
    <EntityPicker
      multiple={multiple}
      items={options}
      itemKey={(option) => ({ id: option.value, label: option.label })}
      value={picked}
      onValueChange={(values) => {
        onChange({ ...rule, value: multiple ? values : values[0] });

        if (!multiple) onDone?.();
      }}
      loading={loading}
      error={error}
      searchPlaceholder={field?.label}
    />
  );
};

const BooleanEditor = ({ rule, onChange, onDone }: RuleEditorProps) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const value = textOf(rule.value);

  return (
    <Command>
      <Command.List>
        {(['true', 'false'] as const).map((option) => (
          <Command.Item
            key={option}
            value={option}
            onSelect={() => {
              onChange({ ...rule, value: option === 'true' });
              onDone?.();
            }}
          >
            {option === 'true' ? t('yes', 'Yes') : t('no', 'No')}
            <Combobox.Check checked={value === option} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

/** Text, or a list typed as "a, b, c" (an automation's "is any of" on text). */
const TextEditor = ({ rule, onChange, onDone }: RuleEditorProps) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const list = LIST_VALUE.has(rule.op);

  return (
    <TypedInput
      focusOnMount={!!onDone}
      className="h-8"
      aria-label={t('value', 'Value')}
      placeholder={list ? t('list-placeholder', 'a, b, c') : t('value', 'Value')}
      initial={list ? valuesOf(rule).join(', ') : textOf(rule.value)}
      onCommit={(text) =>
        onChange({
          ...rule,
          value: list
            ? text
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : text.trim(),
        })
      }
      onEnter={onDone}
    />
  );
};

/** A number as typed: money in the currency's major unit. */
const numberText = (value: unknown, currency: string | undefined) => {
  const n = Number(value);

  if (value === undefined || value === null || value === '' || !Number.isFinite(n)) return '';

  return currency ? toAmountInput(n, currency) : String(n);
};

const numberOf = (text: string, currency: string | undefined) => {
  if (!text.trim() || !Number.isFinite(Number(text))) return undefined;

  return currency ? fromAmountInput(text, currency) : Number(text);
};

/** One number box; an amount of money is typed in the currency's major unit. */
const NumberInput = ({
  value,
  currency,
  label,
  onChange,
  onEnter,
  focusOnMount,
}: {
  value: unknown;
  currency: string | undefined;
  label: string;
  onChange: (value: number | undefined) => void;
  onEnter?: () => void;
  focusOnMount?: boolean;
}) => (
  <TypedInput
    focusOnMount={focusOnMount}
    type="number"
    className="h-8 min-w-0 flex-1"
    aria-label={label}
    placeholder={currency ?? label}
    step={currency ? amountStep(currency) : 'any'}
    initial={numberText(value, currency)}
    onCommit={(text) => onChange(numberOf(text, currency))}
    onEnter={onEnter}
  />
);

/** A number, or both ends of "between". */
const NumberEditor = ({ rule, field, onChange, onDone }: ValueEditorProps) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const currency = field?.currency;

  if (isRule(rule)) {
    return (
      <NumberInput
        focusOnMount={!!onDone}
        value={rule.value}
        currency={currency}
        label={t('value', 'Value')}
        onChange={(value) => onChange({ ...rule, value })}
        onEnter={onDone}
      />
    );
  }

  const [from, to] = valuesBetween(rule);
  const path = rule.rules[0].path;

  return (
    <div className="flex items-center gap-1.5">
      <NumberInput
        focusOnMount={!!onDone}
        value={from}
        currency={currency}
        label={t('from', 'From')}
        onChange={(value) => onChange(between(path, value, to))}
      />
      <span className="text-muted-foreground">–</span>
      <NumberInput
        value={to}
        currency={currency}
        label={t('to', 'To')}
        onChange={(value) => onChange(between(path, from, value))}
        onEnter={onDone}
      />
    </div>
  );
};

/** Whether the value is typed into a box (it fits in a row), rather than picked from a list. */
export const isTypedValue = (rule: TFilterRule, field: TConditionField | undefined) => {
  if (!isRule(rule)) return field?.type !== 'date';

  if (NO_VALUE.has(rule.op) || RELATIVE.has(rule.op)) return false;

  const type = field?.type;

  if (type === 'date' || type === 'boolean' || type === 'member' || type === 'tags') return false;

  return !field?.options?.length;
};

/**
 * The editor for a rule's value, by its operator and its field's type: labelled options with
 * search, text and numbers that apply as typing pauses, relative dates and days on a calendar,
 * yes or no. None when the operator needs no value.
 */
export const ValueEditor = (props: ValueEditorProps) => {
  const { rule, field } = props;
  const type = field?.type;

  if (!isRule(rule)) {
    return type === 'date' ? <DayEditor {...props} /> : <NumberEditor {...props} />;
  }

  const ruleProps = { ...props, rule };

  if (NO_VALUE.has(rule.op)) return null;

  if (RELATIVE.has(rule.op)) return <RelativeEditor {...ruleProps} />;

  if (type === 'date') return <DayEditor {...props} />;

  if (type === 'number') return <NumberEditor {...props} />;

  if (type === 'boolean') return <BooleanEditor {...ruleProps} />;

  if (type === 'member' || type === 'tags' || field?.options?.length) {
    return <OptionsEditor {...ruleProps} />;
  }

  return <TextEditor {...ruleProps} />;
};
