import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormat } from '../../../lib/format';
import { useMoney } from '../../../lib/money';
import { oneOf, textOf } from '../../../lib/text';
import {
  isRule,
  OPERATOR_LABELS,
  RelativeAmount,
  type TConditionGroup,
  type TConditionRule,
} from '../../conditions/conditions';
import { Filter } from '../../filter/components/Filter';
import type { TListFilterField } from '../ListFilter';
import { FIELD_ICONS } from './fieldIcons';
import { NUMBER_OPS, NUMBER_SYMBOLS, presetOf, valuesOf } from './filterRules';
import { useFieldOptions, useListFilter } from './listFilterContext';

/** A filter bar chip: what it filters, the condition (opens it), remove. */
const Chip = ({
  name,
  children,
  onOpen,
  onRemove,
}: {
  name: ReactNode;
  children: ReactNode;
  onOpen: () => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return (
    <div className="flex h-7 items-stretch gap-px rounded bg-muted text-sm font-medium shadow-xs">
      <Filter.BarName>{name}</Filter.BarName>
      <Filter.BarButton onClick={onOpen}>{children}</Filter.BarButton>
      <Filter.BarClose aria-label={t('remove', 'Remove filter')} onClick={onRemove} />
    </div>
  );
};

/** Unknown paths (a removed property) read as text. */
const textField = (path: string): TListFilterField => ({ path, label: path, type: 'text' });

/** English for the `views` namespace's `filter.unit.<unit>`, by plural form. */
const UNIT_LABELS = {
  days: { defaultValue_one: '{{count}} day', defaultValue_other: '{{count}} days' },
  weeks: { defaultValue_one: '{{count}} week', defaultValue_other: '{{count}} weeks' },
  months: { defaultValue_one: '{{count}} month', defaultValue_other: '{{count}} months' },
};

/** A rule as words: the operator and the value. */
const useRuleText = (rule: TConditionRule, field: TListFilterField) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { t: opT } = useTranslation('automations');
  const { options } = useFieldOptions(field);
  const money = useMoney();
  const fmt = useFormat();
  const op = opT(`op.${rule.op}`, OPERATOR_LABELS[rule.op]);

  const labelOf = (value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  const preset = field.type === 'date' ? presetOf(rule) : undefined;
  const span = RelativeAmount.safeParse(rule.value);
  const numberOp = field.type === 'number' ? oneOf(NUMBER_OPS, rule.op) : undefined;
  const is = t('is', 'is');

  if (preset) return { op: '', value: t(`date.${preset.key}`, preset.label) };

  if (rule.op === 'exists' || rule.op === 'not_exists') return { op, value: '' };

  if (span.success) {
    const { amount, unit } = span.data;

    return { op, value: t(`unit.${unit}`, { count: amount, ...UNIT_LABELS[unit] }) };
  }

  if (field.type === 'boolean') {
    return { op: is, value: textOf(rule.value) === 'true' ? t('yes', 'Yes') : t('no', 'No') };
  }

  if (numberOp) {
    const n = Number(rule.value);

    return {
      op: NUMBER_SYMBOLS[numberOp],
      value: field.currency ? money(n, field.currency) : fmt.number(n),
    };
  }

  // Text is quoted; a choice (a tag a list contains) reads as its label.
  if (rule.op === 'contains' && field.type === 'text') {
    return { op, value: `“${textOf(rule.value)}”` };
  }

  const values = valuesOf(rule).map(labelOf);

  if (rule.op === 'in' || rule.op === 'eq') {
    return { op: values.length > 1 ? t('is-any-of', 'is any of') : is, value: values.join(', ') };
  }

  return { op, value: values.join(', ') };
};

const RuleChip = ({ rule, index }: { rule: TConditionRule; index: number }) => {
  const { fields, edit, setPart } = useListFilter();
  const field = fields.find((one) => one.path === rule.path) ?? textField(rule.path);
  const text = useRuleText(rule, field);
  const Icon = field.icon ?? FIELD_ICONS[field.type];

  return (
    <Chip
      name={
        <>
          <Icon />
          {field.label}
        </>
      }
      onOpen={() => edit(index)}
      onRemove={() => setPart(index, null)}
    >
      {text.op && <span className="font-normal text-muted-foreground">{text.op}</span>}
      <span className="truncate">{text.value}</span>
    </Chip>
  );
};

/** A group from the advanced filter: how many conditions; it opens the advanced filter. */
const GroupChip = ({ group, index }: { group: TConditionGroup; index: number }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { openAdvanced, setPart } = useListFilter();
  const count = group.rules.length;

  return (
    <Chip
      name={
        <>
          <IconAdjustmentsHorizontal />
          {t('advanced', 'Advanced filter')}
        </>
      }
      onOpen={openAdvanced}
      onRemove={() => setPart(index, null)}
    >
      {group.match === 'any'
        ? t('any-of', {
            count,
            defaultValue_one: 'any of {{count}} condition',
            defaultValue_other: 'any of {{count}} conditions',
          })
        : t('conditions', {
            count,
            defaultValue_one: '{{count}} condition',
            defaultValue_other: '{{count}} conditions',
          })}
    </Chip>
  );
};

/** Each part of the list's filter as a chip (parts are distinct, so a part is its own key). */
export const RuleChips = () => {
  const { parts } = useListFilter();

  return parts.map((part, index) =>
    isRule(part) ? (
      <RuleChip key={JSON.stringify(part)} rule={part} index={index} />
    ) : (
      <GroupChip key={JSON.stringify(part)} group={part} index={index} />
    ),
  );
};
