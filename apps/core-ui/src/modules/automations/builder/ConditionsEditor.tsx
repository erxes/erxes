import { CONDITION_OPERATORS, type ConditionGroup, type ConditionRule } from '@erxes/core-contract';
import { IconBraces, IconPlus, IconX } from '@tabler/icons-react';
import { Button, cn, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useItemKeys } from '~/lib/useItemKeys';
import { oneOf } from '~/lib/text';
import {
  isRule,
  NO_VALUE,
  OPERATOR_LABELS,
  operatorsFor,
  withOperator,
} from './conditionOperators';
import { ConditionValueInput } from './ConditionValueInput';
import { PathPicker } from './PathPicker';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';

type Subject = 'customer' | 'company' | null;

/** Field and operator side by side, remove at the end; the value takes its own full line. */
const RuleRow = ({
  rule,
  fields,
  disabled,
  subject,
  onChange,
  onRemove,
}: {
  rule: ConditionRule;
  fields: FieldInfo[];
  disabled?: boolean;
  subject: Subject;
  onChange: (next: ConditionRule) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('automations');
  const field = fields.find((one) => one.path === rule.path);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
      <PathPicker
        value={rule.path}
        fields={fields}
        disabled={disabled}
        onChange={(path) => onChange({ ...rule, path })}
      />
      <Select
        value={rule.op}
        onValueChange={(next) => {
          const op = oneOf(CONDITION_OPERATORS, next);

          if (op) onChange(withOperator(rule, op));
        }}
        disabled={disabled}
      >
        <Select.Trigger className="h-8 w-full min-w-0" aria-label={t('operator', 'Operator')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {operatorsFor(field?.type).map((op) => (
            <Select.Item key={op} value={op}>
              {t(`op.${op}`, OPERATOR_LABELS[op])}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Button
        size="icon"
        variant="ghost"
        tone="muted"
        className="size-8"
        disabled={disabled}
        onClick={onRemove}
        aria-label={t('remove', 'Remove')}
      >
        <IconX className="size-4" />
      </Button>
      {!NO_VALUE.has(rule.op) && (
        <div className="col-span-2 flex min-w-0">
          <ConditionValueInput
            rule={rule}
            field={field}
            disabled={disabled}
            subject={subject}
            onChange={(value) => onChange({ ...rule, value })}
          />
        </div>
      )}
    </div>
  );
};

const MatchSelect = ({
  group,
  onChange,
  onRemove,
  disabled,
}: {
  group: ConditionGroup;
  onChange: (next: ConditionGroup) => void;
  onRemove?: () => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{t('match-prefix', 'Match')}</span>
      <Select
        value={group.match}
        onValueChange={(match) => onChange({ ...group, match: match === 'any' ? 'any' : 'all' })}
        disabled={disabled}
      >
        <Select.Trigger className="h-8 w-24" aria-label={t('match-prefix', 'Match')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="all">{t('match-all', 'all')}</Select.Item>
          <Select.Item value="any">{t('match-any', 'any')}</Select.Item>
        </Select.Content>
      </Select>
      <span>{t('match-suffix', 'of these')}</span>
      {onRemove && (
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          disabled={disabled}
          onClick={onRemove}
        >
          <IconX />
        </Button>
      )}
    </div>
  );
};

const AddButtons = ({
  newRule,
  newGroup,
  disabled,
  onAdd,
}: {
  newRule: ConditionRule;
  /** Null at the deepest level. */
  newGroup: ConditionGroup | null;
  disabled?: boolean;
  onAdd: (rule: ConditionRule | ConditionGroup) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => onAdd(newRule)}>
        <IconPlus />
        {t('add-condition', 'Add condition')}
      </Button>
      {newGroup && (
        <Button size="sm" variant="ghost" disabled={disabled} onClick={() => onAdd(newGroup)}>
          <IconBraces />
          {t('add-group', 'Add group')}
        </Button>
      )}
    </div>
  );
};

/** One group: "all"/"any" of its rules and nested groups (up to three levels). */
const GroupEditor = ({
  group,
  onChange,
  onRemove,
  fields,
  disabled,
  depth,
  subject,
}: {
  group: ConditionGroup;
  onChange: (next: ConditionGroup) => void;
  onRemove?: () => void;
  fields: FieldInfo[];
  disabled?: boolean;
  depth: number;
  subject: Subject;
}) => {
  const keys = useItemKeys(group.rules.length);

  const update = (index: number, rule: ConditionRule | ConditionGroup) =>
    onChange({ ...group, rules: group.rules.map((item, at) => (at === index ? rule : item)) });

  const remove = (index: number) => {
    keys.removed(index);
    onChange({ ...group, rules: group.rules.filter((_, at) => at !== index) });
  };

  const add = (rule: ConditionRule | ConditionGroup) => {
    keys.added();
    onChange({ ...group, rules: [...group.rules, rule] });
  };

  return (
    <div className={cn('space-y-2', depth > 0 && 'rounded-md border border-dashed p-2')}>
      <MatchSelect group={group} onChange={onChange} onRemove={onRemove} disabled={disabled} />
      {group.rules.map((rule, index) =>
        isRule(rule) ? (
          <RuleRow
            key={keys.keyAt(index)}
            rule={rule}
            fields={fields}
            disabled={disabled}
            subject={subject}
            onChange={(next) => update(index, next)}
            onRemove={() => remove(index)}
          />
        ) : (
          <GroupEditor
            key={keys.keyAt(index)}
            group={rule}
            fields={fields}
            disabled={disabled}
            subject={subject}
            depth={depth + 1}
            onChange={(next) => update(index, next)}
            onRemove={() => remove(index)}
          />
        ),
      )}
      <AddButtons
        newRule={{ path: fields[3]?.path ?? 'subject.primaryEmail', op: 'exists' }}
        newGroup={depth < 2 ? { match: group.match === 'all' ? 'any' : 'all', rules: [] } : null}
        disabled={disabled}
        onAdd={add}
      />
    </div>
  );
};

/** Conditions: rows "<field> <operator> <value>", all or any, with nested groups. */
export const ConditionsEditor = ({
  value,
  onChange,
  disabled,
  subject = null,
  extraFields = [],
  fields: given,
}: {
  value: ConditionGroup | undefined;
  onChange: (next: ConditionGroup | undefined) => void;
  disabled?: boolean;
  subject?: Subject;
  /** Outputs of earlier steps, offered next to the record's fields. */
  extraFields?: FieldInfo[];
  /** Instead of the automation catalog (a list's advanced filter gives its own, grouped). */
  fields?: FieldInfo[];
}) => {
  const { fields: loaded } = useAutomationFields(given ? null : subject);
  const base = given ?? loaded;
  const fields = extraFields.length ? [...base, ...extraFields] : base;
  const group: ConditionGroup = value ?? { match: 'all', rules: [] };

  return (
    <GroupEditor
      group={group}
      fields={fields}
      disabled={disabled}
      subject={subject}
      depth={0}
      onChange={(next) => onChange(next.rules.length ? next : undefined)}
    />
  );
};
