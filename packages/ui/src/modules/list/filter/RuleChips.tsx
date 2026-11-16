import { IconAdjustmentsHorizontal, IconX } from '@tabler/icons-react';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/button';
import { useItemKeys } from '../../../hooks/use-item-keys';
import { isRule, NO_VALUE, type TConditionGroup } from '../../conditions/conditions';
import {
  isFilled,
  opOf,
  pathOf,
  ruleCount,
  type TFilterRule,
  withField,
  withOperator,
} from '../../conditions/filterRule';
import { FieldIcon } from '../../conditions/fieldIcons';
import { useRuleText } from '../../conditions/filterText';
import { FieldPart, OperatorPart, ValuePart } from '../../conditions/RuleParts';
import { useFieldAt, useListFilter } from './listFilterContext';

/** A chip: joined segments on a muted ground, the last one a remove button. */
export const Chip = ({
  children,
  removeLabel,
  onRemove,
}: {
  children: ReactNode;
  removeLabel: string;
  onRemove: () => void;
}) => (
  <div className="flex h-7 max-w-full min-w-0 items-stretch gap-px overflow-hidden rounded bg-muted text-sm shadow-xs">
    {children}
    <Button variant="segment" size="icon" aria-label={removeLabel} onClick={onRemove}>
      <IconX />
    </Button>
  </div>
);

/** A segment of a chip that opens its editor. */
const Segment = ({ className, ...props }: Omit<ComponentProps<typeof Button>, 'variant'>) => (
  <Button variant="segment" className={className ?? 'max-w-60 min-w-0 gap-1.5 px-2'} {...props} />
);

type Part = 'field' | 'op' | 'value';

/**
 * A condition as a chip: its field, operator and value, each opening its editor in place, and
 * remove. A change that leaves the rule unfinished (an operator that needs another value) waits
 * on the chip until the value is picked; closing it unfinished keeps the rule as it was.
 */
const RuleChip = ({ rule, index }: { rule: TFilterRule; index: number }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { fields, lookups, setPart } = useListFilter();
  const [draft, setDraft] = useState<TFilterRule | null>(null);
  const [open, setOpen] = useState<Part | null>(null);
  const shown = draft ?? rule;
  const field = useFieldAt(pathOf(shown));
  const text = useRuleText(shown, field, lookups);

  /** A finished rule applies; an unfinished one waits here, with its value open. */
  const change = (next: TFilterRule) => {
    if (isFilled(next)) {
      setDraft(null);
      setPart(index, next);
    } else {
      setDraft(next);
      setOpen('value');
    }
  };

  const toggle = (part: Part) => (next: boolean) => {
    setOpen(next ? part : null);

    if (!next) setDraft(null);
  };

  const pick = (next: TFilterRule) => {
    setOpen(null);
    change(next);
  };

  return (
    <Chip
      removeLabel={t('remove-named', { name: field.label, defaultValue: 'Remove {{name}} filter' })}
      onRemove={() => setPart(index, null)}
    >
      <FieldPart
        fields={fields}
        field={field}
        open={open === 'field'}
        onOpenChange={toggle('field')}
        onSelect={(next) => pick(withField(shown, field, next))}
        button={
          <Segment className="max-w-48 min-w-0 gap-1.5 rounded-l px-2 font-medium">
            <FieldIcon field={field} className="text-muted-foreground" />
            <span className="truncate">{field.label}</span>
          </Segment>
        }
      />
      <OperatorPart
        rule={shown}
        field={field}
        open={open === 'op'}
        onOpenChange={toggle('op')}
        onSelect={(op) => pick(withOperator(shown, op))}
        button={<Segment className="shrink-0 px-2 text-muted-foreground">{text.op}</Segment>}
      />
      {!NO_VALUE.has(opOf(shown)) && (
        <ValuePart
          rule={shown}
          field={field}
          lookups={lookups}
          onChange={change}
          open={open === 'value'}
          onOpenChange={toggle('value')}
          button={
            <Segment
              aria-label={t('value-of', {
                name: field.label,
                value: text.value,
                defaultValue: '{{name}}: {{value}}',
              })}
            >
              <span className="truncate font-medium">{text.value}</span>
            </Segment>
          }
        />
      )}
      {isRule(shown) && shown.where && <WhereSegment where={shown.where} />}
    </Chip>
  );
};

/** A relation rule's "where": how many rules narrow its records; the advanced filter edits them. */
const WhereSegment = ({ where }: { where: TConditionGroup }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { setAdvancedOpen } = useListFilter();

  return (
    <Segment className="shrink-0 px-2 text-muted-foreground" onClick={() => setAdvancedOpen(true)}>
      {t('where-chip', {
        count: ruleCount(where),
        defaultValue_one: 'where {{count}} rule',
        defaultValue_other: 'where {{count}} rules',
      })}
    </Segment>
  );
};

/** A filter with "or" or nested groups: one chip, which opens the advanced filter. */
const AdvancedChip = () => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { advanced, setAdvanced, setAdvancedOpen } = useListFilter();
  const count = advanced ? ruleCount(advanced) : 0;

  return (
    <Chip
      removeLabel={t('remove-advanced', 'Remove the advanced filter')}
      onRemove={() => setAdvanced(null)}
    >
      <Segment
        className="min-w-0 gap-1.5 rounded-l px-2 font-medium"
        onClick={() => setAdvancedOpen(true)}
      >
        <IconAdjustmentsHorizontal className="text-muted-foreground" />
        {t('advanced-chip', {
          count,
          defaultValue_one: 'Advanced · {{count}} rule',
          defaultValue_other: 'Advanced · {{count}} rules',
        })}
      </Segment>
    </Chip>
  );
};

/**
 * The list's conditions as chips, one per rule (keyed by place, so an open editor stays open as
 * its rule changes), or the advanced filter's chip.
 */
export const RuleChips = () => {
  const { chips } = useListFilter();
  const keys = useItemKeys(chips?.length ?? 0);

  if (!chips) return <AdvancedChip />;

  return chips.map((rule, index) => <RuleChip key={keys.keyAt(index)} rule={rule} index={index} />);
};
