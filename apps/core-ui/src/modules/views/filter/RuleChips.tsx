import { type ConditionGroup, type ConditionRule, RelativeAmount } from '@erxes/core-contract';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Filter } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMoney } from '~/lib/money';
import { oneOf, textOf } from '~/lib/text';
import { isRule, OPERATOR_LABELS } from '~/modules/automations/builder/conditionOperators';
import type { ListField } from '../useViews';
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
      <Filter.BarClose aria-label={t('remove')} onClick={onRemove} />
    </div>
  );
};

/** Unknown paths (a removed property) read as text. */
const textField = (path: string): ListField => ({
  path,
  label: path,
  type: 'text',
  group: 'fields',
});

/** A rule as words: the operator and the value. */
const useRuleText = (rule: ConditionRule, field: ListField) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { t: opT } = useTranslation('automations');
  const { options } = useFieldOptions(field);
  const money = useMoney();
  const op = opT(`op.${rule.op}`, OPERATOR_LABELS[rule.op]);

  const labelOf = (value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  const preset = field.type === 'date' ? presetOf(rule) : undefined;
  const span = RelativeAmount.safeParse(rule.value);
  const numberOp = field.type === 'number' ? oneOf(NUMBER_OPS, rule.op) : undefined;

  if (preset) return { op: '', value: t(`date.${preset.key}`) };

  if (rule.op === 'exists' || rule.op === 'not_exists') return { op, value: '' };

  if (span.success) return { op, value: t(`unit.${span.data.unit}`, { count: span.data.amount }) };

  if (field.type === 'boolean') {
    return { op: t('is'), value: textOf(rule.value) === 'true' ? t('yes') : t('no') };
  }

  if (numberOp) {
    const n = Number(rule.value);

    return {
      op: NUMBER_SYMBOLS[numberOp],
      value: field.currency ? money(n, field.currency) : n.toLocaleString(),
    };
  }

  if (rule.op === 'contains') return { op, value: `“${textOf(rule.value)}”` };

  const values = valuesOf(rule).map(labelOf);

  if (rule.op === 'in' || rule.op === 'eq') {
    return { op: values.length > 1 ? t('is-any-of') : t('is'), value: values.join(', ') };
  }

  return { op, value: values.join(', ') };
};

const RuleChip = ({ rule, index }: { rule: ConditionRule; index: number }) => {
  const { fields, edit, setPart } = useListFilter();
  const field = fields.find((one) => one.path === rule.path) ?? textField(rule.path);
  const text = useRuleText(rule, field);
  const Icon = FIELD_ICONS[field.type];

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
const GroupChip = ({ group, index }: { group: ConditionGroup; index: number }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { openAdvanced, setPart } = useListFilter();
  const count = group.rules.length;

  return (
    <Chip
      name={
        <>
          <IconAdjustmentsHorizontal />
          {t('advanced')}
        </>
      }
      onOpen={openAdvanced}
      onRemove={() => setPart(index, null)}
    >
      {group.match === 'any' ? t('any-of', { count }) : t('conditions', { count })}
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
