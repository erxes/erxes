import { IconChevronDown, IconX } from '@tabler/icons-react';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/button';
import { cn } from '../../lib/utils';
import { NO_VALUE, type TConditionField, type TConditionLookups } from './conditions';
import { opOf, pathOf, type TFilterRule, withField, withOperator } from './filterRule';
import { FieldIcon } from './fieldIcons';
import { useRuleText } from './filterText';
import { FieldPart, OperatorPart, ValuePart } from './RuleParts';
import { isTypedValue, ValueEditor } from './ValueEditor';

export type RowShared = {
  fields: TConditionField[];
  lookups: TConditionLookups;
  disabled?: boolean;
  customPath?: boolean;
};

type Part = 'field' | 'op' | 'value';

/** A path no field has (an automation's typed path, a removed property) reads as text. */
const fieldAt = (fields: TConditionField[], path: string): TConditionField =>
  fields.find((field) => field.path === path) ?? { path, label: path, type: 'text' };

/** A row's part as a button; the popover it opens adds its handlers and state. */
const RowButton = ({ className, ...props }: Omit<ComponentProps<typeof Button>, 'variant'>) => (
  <Button
    variant="outline"
    className={cn('h-8 w-full min-w-0 justify-start font-normal', className)}
    {...props}
  />
);

/** The row's (or a group's) last cell: an X named for what it removes. */
export const RemoveButton = ({
  label,
  disabled,
  onRemove,
}: {
  label: string;
  disabled?: boolean;
  onRemove: () => void;
}) => (
  <Button
    size="icon"
    variant="ghost"
    tone="muted"
    disabled={disabled}
    onClick={onRemove}
    aria-label={label}
  >
    <IconX />
  </Button>
);

/** A typed value sits in the row; a picked one (a list, a calendar) opens from a button. */
const RowValue = ({
  rule,
  field,
  lookups,
  disabled,
  onChange,
  open,
  onOpenChange,
}: {
  rule: TFilterRule;
  field: TConditionField;
  lookups: TConditionLookups;
  disabled?: boolean;
  onChange: (next: TFilterRule) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const text = useRuleText(rule, field, lookups);
  const op = opOf(rule);

  if (NO_VALUE.has(op)) return <span />;

  if (isTypedValue(rule, field) && !disabled) {
    return (
      <ValueEditor
        key={`${pathOf(rule)}:${op}`}
        rule={rule}
        field={field}
        lookups={lookups}
        onChange={onChange}
      />
    );
  }

  const empty = text.value === '…';

  return (
    <ValuePart
      rule={rule}
      field={field}
      lookups={lookups}
      onChange={onChange}
      open={open}
      onOpenChange={onOpenChange}
      button={
        <RowButton disabled={disabled} aria-label={t('value', 'Value')}>
          <span className={cn('truncate', empty && 'text-muted-foreground')}>
            {empty ? t('choose', 'Choose…') : text.value}
          </span>
        </RowButton>
      }
    />
  );
};

/**
 * A row of the advanced filter (and an automation's conditions): `lead` ("Where", "And", "Or"),
 * then the field, the operator and the value, each opening its editor, then remove. `fresh`
 * opens the value at once, for a row just added.
 */
export const RuleRow = ({
  rule,
  fields,
  lookups,
  disabled,
  customPath,
  lead,
  fresh,
  onChange,
  onRemove,
}: RowShared & {
  rule: TFilterRule;
  lead: ReactNode;
  fresh: boolean;
  onChange: (next: TFilterRule) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const field = fieldAt(fields, pathOf(rule));
  const text = useRuleText(rule, field, lookups);
  const [open, setOpen] = useState<Part | null>(fresh ? 'value' : null);
  const toggle = (part: Part) => (next: boolean) => setOpen(next ? part : null);

  return (
    <div className="grid grid-cols-condition items-center gap-1.5">
      {lead}
      <FieldPart
        fields={fields}
        field={field}
        customPath={customPath}
        open={open === 'field'}
        onOpenChange={toggle('field')}
        onSelect={(next) => {
          onChange(withField(rule, field, next));
          setOpen(null);
        }}
        button={
          <RowButton disabled={disabled} aria-label={t('field', 'Field')}>
            <FieldIcon field={field} className="text-muted-foreground" />
            <span className="truncate">{field.label}</span>
          </RowButton>
        }
      />
      <OperatorPart
        rule={rule}
        field={field}
        open={open === 'op'}
        onOpenChange={toggle('op')}
        onSelect={(op) => {
          const next = withOperator(rule, op);

          onChange(next);
          // A value picked from a list opens right after its operator.
          setOpen(NO_VALUE.has(op) || isTypedValue(next, field) ? null : 'value');
        }}
        button={
          <RowButton
            className="justify-between"
            disabled={disabled}
            aria-label={t('operator', 'Operator')}
          >
            <span className="truncate">{text.op}</span>
            <IconChevronDown className="text-muted-foreground" />
          </RowButton>
        }
      />
      <RowValue
        rule={rule}
        field={field}
        lookups={lookups}
        disabled={disabled}
        onChange={onChange}
        open={open === 'value'}
        onOpenChange={toggle('value')}
      />
      <RemoveButton
        label={t('remove-rule', 'Remove rule')}
        disabled={disabled}
        onRemove={onRemove}
      />
    </div>
  );
};
