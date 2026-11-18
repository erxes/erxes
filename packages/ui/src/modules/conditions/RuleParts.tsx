import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Combobox } from '../../components/combobox';
import { Command } from '../../components/command';
import { Popover } from '../../components/popover';
import { cn } from '../../lib/utils';
import { RELATIVE, type TConditionField, type TConditionLookups } from './conditions';
import { operatorsFor, opOf, pathOf, type TFilterOperator, type TFilterRule } from './filterRule';
import { FieldPicker } from './FieldPicker';
import { useOperatorLabel } from './filterText';
import { ValueEditor } from './ValueEditor';

/** The operators of the field's type (and the rule's own, should it be another); a pick changes it. */
const OperatorMenu = ({
  rule,
  field,
  onSelect,
}: {
  rule: TFilterRule;
  field: TConditionField;
  onSelect: (op: TFilterOperator) => void;
}) => {
  const label = useOperatorLabel();
  const current = opOf(rule);
  const ops = operatorsFor(field);

  return (
    <Command>
      <Command.List>
        {(ops.includes(current) ? ops : [current, ...ops]).map((op) => (
          <Command.Item key={op} value={op} onSelect={() => onSelect(op)}>
            {label(op, field.type)}
            <Combobox.Check checked={op === current} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

type PartProps = {
  /** The button the part shows; it opens the editor. */
  button: ReactElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * One part of a rule (its field, operator or value) as a button that opens its editor in a
 * popover: a chip's segments and the advanced filter's rows both use it.
 */
const RulePart = ({
  part,
  button,
  open,
  onOpenChange,
  className,
  children,
}: PartProps & {
  /** Which part it edits, which names the popup. */
  part: 'field' | 'operator' | 'value';
  /** The popup's width. */
  className: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  const names = {
    field: t('field', 'Field'),
    operator: t('operator', 'Operator'),
    value: t('value', 'Value'),
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger render={button} />
      <Popover.Content variant="flush" align="start" className={className} aria-label={names[part]}>
        {children}
      </Popover.Content>
    </Popover>
  );
};

/** The rule's field: the grouped, searchable field list. */
export const FieldPart = ({
  fields,
  field,
  customPath,
  onSelect,
  ...part
}: PartProps & {
  fields: TConditionField[];
  field: TConditionField;
  customPath?: boolean;
  onSelect: (field: TConditionField) => void;
}) => (
  <RulePart {...part} part="field" className="w-72">
    <FieldPicker fields={fields} value={field.path} customPath={customPath} onSelect={onSelect} />
  </RulePart>
);

/** The rule's operator: those of the field's type. */
export const OperatorPart = ({
  rule,
  field,
  onSelect,
  ...part
}: PartProps & {
  rule: TFilterRule;
  field: TConditionField;
  onSelect: (op: TFilterOperator) => void;
}) => (
  <RulePart {...part} part="operator" className="w-56">
    <OperatorMenu rule={rule} field={field} onSelect={onSelect} />
  </RulePart>
);

/** The rule's value, in the editor its operator and type need; a final pick closes it. */
export const ValuePart = ({
  rule,
  field,
  lookups,
  onChange,
  ...part
}: PartProps & {
  rule: TFilterRule;
  field: TConditionField;
  lookups: TConditionLookups;
  onChange: (next: TFilterRule) => void;
}) => {
  const op = opOf(rule);
  const calendar = field.type === 'date' && !RELATIVE.has(op);
  const typed = field.type === 'number' || field.type === 'text';

  return (
    <RulePart {...part} part="value" className={calendar ? 'w-auto' : 'w-72'}>
      <div className={cn(typed && 'p-2')}>
        <ValueEditor
          // A new operator or field starts the editor anew.
          key={`${pathOf(rule)}:${op}`}
          rule={rule}
          field={field}
          lookups={lookups}
          onChange={onChange}
          onDone={() => part.onOpenChange(false)}
        />
      </div>
    </RulePart>
  );
};
