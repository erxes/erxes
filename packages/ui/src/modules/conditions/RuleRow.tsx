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

/**
 * A row's part as a button, named "Field: Name" (the part, then the text it shows); the popover
 * it opens adds its handlers and state.
 */
const RowButton = ({
  part,
  shows,
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, 'variant'> & { part: string; shows: string }) => (
  <Button
    variant="outline"
    aria-label={`${part}: ${shows}`}
    className={cn('h-8 w-full min-w-0 justify-start font-normal', className)}
    {...props}
  />
);

/** The operator's button: its words and a chevron. Props pass through to the popover trigger. */
const OperatorButton = ({
  shows,
  ...props
}: Omit<ComponentProps<typeof Button>, 'variant'> & { shows: string }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return (
    <RowButton
      className="justify-between"
      part={t('operator', 'Operator')}
      shows={shows}
      {...props}
    >
      <span className="truncate">{shows}</span>
      <IconChevronDown className="text-muted-foreground" />
    </RowButton>
  );
};

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
  const shows = empty ? t('choose', 'Choose…') : text.value;

  return (
    <ValuePart
      rule={rule}
      field={field}
      lookups={lookups}
      onChange={onChange}
      open={open}
      onOpenChange={onOpenChange}
      button={
        <RowButton disabled={disabled} part={t('value', 'Value')} shows={shows}>
          <span className={cn('truncate', empty && 'text-muted-foreground')}>{shows}</span>
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
          <RowButton disabled={disabled} part={t('field', 'Field')} shows={field.label}>
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
        button={<OperatorButton shows={text.op} disabled={disabled} />}
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
