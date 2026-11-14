import type { ConditionRule } from '@erxes/core-contract';
import { Button, Combobox, Command, Input, Select, useFilterContext } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { amountStep, fromAmountInput, toAmountInput } from '~/lib/money';
import { oneOf, textOf } from '~/lib/text';
import { isRule } from '~/modules/automations/builder/conditionOperators';
import { LookupError } from '~/modules/automations/builder/lookupOptions';
import type { ListField } from '../useViews';
import {
  DATE_PRESETS,
  NUMBER_OPS,
  NUMBER_SYMBOLS,
  presetOf,
  targetOf,
  toggled,
  valuesOf,
} from './filterRules';
import { useFieldOptions, useListFilter } from './listFilterContext';

/** The part this field's menu changes, and that part when it is a rule of the field. */
const useTarget = (field: ListField) => {
  const { parts, setPart, editing } = useListFilter();
  const { resetFilterState } = useFilterContext();
  const index = targetOf(parts, field, editing);
  const part = index === null ? undefined : parts[index];
  const rule = part && isRule(part) && part.path === field.path ? part : undefined;

  return {
    rule,
    set: (next: ConditionRule | null) => setPart(index, next),
    /** Sets the rule and closes the menu. */
    apply: (next: ConditionRule | null) => {
      setPart(index, next);
      resetFilterState();
    },
  };
};

/** A submenu's box takes the keyboard as the submenu opens. */
const useFocusOnMount = () => {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  return input;
};

/** Options (a choice, members, tags): each pick adds to or takes from one "is any of" rule; the menu stays open. */
const OptionsMenu = ({ field }: { field: ListField }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { options, error } = useFieldOptions(field);
  const { rule, set } = useTarget(field);
  const picked = valuesOf(rule);

  return (
    <Command>
      <Command.Input placeholder={field.label} variant="secondary" focusOnMount />
      <Command.List>
        <Command.Empty>{t('no-options')}</Command.Empty>
        {options.map((option) => (
          <Command.Item
            key={option.value}
            value={`${option.label} ${option.value}`}
            onSelect={() => set(toggled(field.path, picked, option.value))}
          >
            <span className="truncate">{option.label}</span>
            <Combobox.Check checked={picked.includes(option.value)} />
          </Command.Item>
        ))}
        <LookupError error={error} />
      </Command.List>
    </Command>
  );
};

const DateMenu = ({ field }: { field: ListField }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter.date' });
  const { rule, apply } = useTarget(field);
  const current = presetOf(rule);

  return (
    <Command>
      <Command.List>
        {DATE_PRESETS.map((preset) => (
          <Command.Item
            key={preset.key}
            value={preset.key}
            onSelect={() => apply({ path: field.path, op: preset.op, value: preset.value })}
          >
            {t(preset.key)}
            <Combobox.Check checked={current?.key === preset.key} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const BooleanMenu = ({ field }: { field: ListField }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { rule, apply } = useTarget(field);
  const value = rule ? textOf(rule.value) : null;

  return (
    <Command>
      <Command.List>
        {(['true', 'false'] as const).map((option) => (
          <Command.Item
            key={option}
            value={option}
            onSelect={() => apply({ path: field.path, op: 'eq', value: option === 'true' })}
          >
            {option === 'true' ? t('yes') : t('no')}
            <Combobox.Check checked={value === option} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

/** A number as typed: money in the currency's major unit. */
const numberText = (value: unknown, currency: string | undefined) => {
  const n = Number(value);

  if (value === undefined || value === null || !Number.isFinite(n)) return '';

  return currency ? toAmountInput(n, currency) : String(n);
};

/** An operator and a value; Enter or Apply adds the rule (or changes the one being edited). */
const NumberMenu = ({ field }: { field: ListField }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { rule, apply } = useTarget(field);
  const [op, setOp] = useState(oneOf(NUMBER_OPS, rule?.op ?? null) ?? 'gte');
  const [text, setText] = useState(numberText(rule?.value, field.currency));
  const valid = text.trim() !== '' && Number.isFinite(Number(text));
  const input = useFocusOnMount();

  return (
    <form
      className="flex items-center gap-1.5 p-2"
      onSubmit={(event) => {
        event.preventDefault();

        if (!valid) return;

        const value = field.currency ? fromAmountInput(text, field.currency) : Number(text);

        apply({ path: field.path, op, value });
      }}
    >
      <Select value={op} onValueChange={(next) => setOp(oneOf(NUMBER_OPS, next) ?? op)}>
        <Select.Trigger className="h-8 w-16 shrink-0">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {NUMBER_OPS.map((option) => (
            <Select.Item key={option} value={option}>
              {NUMBER_SYMBOLS[option]}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Input
        ref={input}
        type="number"
        className="h-8 min-w-0 flex-1"
        step={field.currency ? amountStep(field.currency) : 'any'}
        placeholder={field.currency ?? t('value')}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button type="submit" size="sm" className="h-8" disabled={!valid}>
        {t('apply')}
      </Button>
    </form>
  );
};

/** "Contains" text; an empty box removes the rule being edited. */
const TextMenu = ({ field }: { field: ListField }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { rule, apply } = useTarget(field);
  const [text, setText] = useState(textOf(rule?.value));
  const input = useFocusOnMount();

  return (
    <form
      className="flex items-center gap-1.5 p-2"
      onSubmit={(event) => {
        event.preventDefault();
        apply(text.trim() ? { path: field.path, op: 'contains', value: text.trim() } : null);
      }}
    >
      <Input
        ref={input}
        className="h-8 min-w-0 flex-1"
        placeholder={t('contains')}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button type="submit" size="sm" className="h-8">
        {t('apply')}
      </Button>
    </form>
  );
};

/** A field's submenu, by its type. */
export const FieldMenu = ({ field }: { field: ListField }) => {
  switch (field.type) {
    case 'select':
    case 'member':
    case 'tags':
      return <OptionsMenu field={field} />;

    case 'date':
      return <DateMenu field={field} />;

    case 'boolean':
      return <BooleanMenu field={field} />;

    case 'number':
      return <NumberMenu field={field} />;

    case 'text':
      return <TextMenu field={field} />;
  }
};
