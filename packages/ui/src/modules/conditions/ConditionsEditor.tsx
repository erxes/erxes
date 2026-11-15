import { IconBraces, IconPlus, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/button';
import { Select } from '../../components/select';
import { useItemKeys } from '../../hooks/use-item-keys';
import { oneOf } from '../../lib/text';
import { cn } from '../../lib/utils';
import {
  CONDITION_OPERATORS,
  isRule,
  NO_VALUE,
  OPERATOR_LABELS,
  operatorsFor,
  type TConditionField,
  type TConditionGroup,
  type TConditionLookups,
  type TConditionRule,
  withOperator,
} from './conditions';
import { ConditionValueInput } from './ConditionValueInput';
import { PathPicker } from './PathPicker';

/** Field and operator side by side, remove at the end; the value takes its own full line. */
const RuleRow = ({
  rule,
  fields,
  disabled,
  lookups,
  onChange,
  onRemove,
}: {
  rule: TConditionRule;
  fields: TConditionField[];
  disabled?: boolean;
  lookups: TConditionLookups;
  onChange: (next: TConditionRule) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('automations');
  const field = fields.find((one) => one.path === rule.path);

  return (
    <div className="grid grid-cols-condition items-center gap-2">
      <PathPicker
        value={rule.path}
        fields={fields}
        disabled={disabled}
        // A value means something only for its field's type: an owner's member id is no tag.
        onChange={(path) =>
          onChange(
            fields.find((one) => one.path === path)?.type === field?.type
              ? { ...rule, path }
              : { ...rule, path, value: undefined },
          )
        }
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
            {...lookups}
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
  group: TConditionGroup;
  onChange: (next: TConditionGroup) => void;
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
  newRule: TConditionRule;
  /** Null at the deepest level. */
  newGroup: TConditionGroup | null;
  disabled?: boolean;
  onAdd: (rule: TConditionRule | TConditionGroup) => void;
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
  lookups,
}: {
  group: TConditionGroup;
  onChange: (next: TConditionGroup) => void;
  onRemove?: () => void;
  fields: TConditionField[];
  disabled?: boolean;
  depth: number;
  lookups: TConditionLookups;
}) => {
  const keys = useItemKeys(group.rules.length);

  const update = (index: number, rule: TConditionRule | TConditionGroup) =>
    onChange({ ...group, rules: group.rules.map((item, at) => (at === index ? rule : item)) });

  const remove = (index: number) => {
    keys.removed(index);
    onChange({ ...group, rules: group.rules.filter((_, at) => at !== index) });
  };

  const add = (rule: TConditionRule | TConditionGroup) => {
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
            lookups={lookups}
            onChange={(next) => update(index, next)}
            onRemove={() => remove(index)}
          />
        ) : (
          <GroupEditor
            key={keys.keyAt(index)}
            group={rule}
            fields={fields}
            disabled={disabled}
            lookups={lookups}
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

/**
 * Conditions: rows "<field> <operator> <value>", all or any, with nested groups, on `fields`
 * (grouped in the picker when they have a `group`); `members` and `tags` feed their pickers.
 */
export const ConditionsEditor = ({
  value,
  onChange,
  disabled,
  fields,
  ...lookups
}: TConditionLookups & {
  value: TConditionGroup | undefined;
  onChange: (next: TConditionGroup | undefined) => void;
  disabled?: boolean;
  fields: TConditionField[];
}) => {
  const group: TConditionGroup = value ?? { match: 'all', rules: [] };

  return (
    <GroupEditor
      group={group}
      fields={fields}
      disabled={disabled}
      lookups={lookups}
      depth={0}
      onChange={(next) => onChange(next.rules.length ? next : undefined)}
    />
  );
};
