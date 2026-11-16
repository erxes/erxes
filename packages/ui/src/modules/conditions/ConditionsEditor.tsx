import { IconBraces, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/button';
import { Popover } from '../../components/popover';
import { Select } from '../../components/select';
import { useItemKeys } from '../../hooks/use-item-keys';
import {
  isRule,
  NO_VALUE,
  type TConditionField,
  type TConditionGroup,
  type TConditionLookups,
  type TConditionRule,
} from './conditions';
import { isFilterRule, ruleFor, type TFilterRule } from './filterRule';
import { FieldPicker } from './FieldPicker';
import { RemoveButton, type RowShared, RuleRow } from './RuleRow';

/** "Where" first; the second row picks "and" or "or" for the group; the rest repeat it. */
const Conjunction = ({
  index,
  group,
  disabled,
  onChange,
}: {
  index: number;
  group: TConditionGroup;
  disabled?: boolean;
  onChange: (next: TConditionGroup) => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const word = group.match === 'all' ? t('and', 'And') : t('or', 'Or');

  if (index === 0) {
    return <span className="px-2 text-sm text-muted-foreground">{t('where', 'Where')}</span>;
  }

  if (index > 1 || disabled) {
    return <span className="px-2 text-sm text-muted-foreground">{word}</span>;
  }

  return (
    <Select
      value={group.match}
      onValueChange={(match) => onChange({ ...group, match: match === 'any' ? 'any' : 'all' })}
    >
      <Select.Trigger className="h-8 w-full" aria-label={t('conjunction', 'And or or')}>
        <Select.Value>{word}</Select.Value>
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">{t('and', 'And')}</Select.Item>
        <Select.Item value="any">{t('or', 'Or')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

/** "Add filter rule" opens the field picker; "Add filter group", while groups may still nest. */
const AddButtons = ({
  fields,
  disabled,
  customPath,
  canGroup,
  onAdd,
}: Omit<RowShared, 'lookups'> & {
  canGroup: boolean;
  onAdd: (node: TFilterRule | TConditionGroup) => void;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          render={<Button size="sm" variant="ghost" tone="muted" disabled={disabled} />}
        >
          <IconPlus />
          {t('add-rule', 'Add filter rule')}
        </Popover.Trigger>
        <Popover.Content variant="flush" align="start" className="w-72">
          <FieldPicker
            fields={fields}
            customPath={customPath}
            onSelect={(field) => {
              setOpen(false);
              onAdd(ruleFor(field));
            }}
          />
        </Popover.Content>
      </Popover>
      {canGroup && (
        <Button
          size="sm"
          variant="ghost"
          tone="muted"
          disabled={disabled}
          onClick={() => onAdd({ match: 'all', rules: [] })}
        >
          <IconBraces />
          {t('add-group', 'Add filter group')}
        </Button>
      )}
    </div>
  );
};

/** One group: its rows and nested groups (three levels in all), then the add buttons. */
const GroupEditor = ({
  group,
  onChange,
  depth,
  ...shared
}: RowShared & {
  group: TConditionGroup;
  onChange: (next: TConditionGroup) => void;
  depth: number;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const keys = useItemKeys(group.rules.length);
  const [fresh, setFresh] = useState<number | null>(null);

  const update = (index: number, node: TConditionRule | TConditionGroup) =>
    onChange({ ...group, rules: group.rules.map((item, at) => (at === index ? node : item)) });

  const remove = (index: number) => {
    keys.removed(index);
    onChange({ ...group, rules: group.rules.filter((_, at) => at !== index) });
  };

  const lead = (index: number) => (
    <Conjunction index={index} group={group} disabled={shared.disabled} onChange={onChange} />
  );

  return (
    <div className="flex flex-col gap-1.5">
      {group.rules.map((node, index) =>
        isFilterRule(node) ? (
          <RuleRow
            key={keys.keyAt(index)}
            {...shared}
            rule={node}
            lead={lead(index)}
            fresh={fresh === index}
            onChange={(next) => update(index, next)}
            onRemove={() => remove(index)}
          />
        ) : (
          <div key={keys.keyAt(index)} className="grid grid-cols-condition items-start gap-1.5">
            {lead(index)}
            <div className="col-span-3 rounded-md border bg-muted/40 p-2">
              <GroupEditor
                {...shared}
                group={node}
                depth={depth + 1}
                onChange={(next) => update(index, next)}
              />
            </div>
            <RemoveButton
              label={t('remove-group', 'Remove group')}
              disabled={shared.disabled}
              onRemove={() => remove(index)}
            />
          </div>
        ),
      )}
      <AddButtons
        fields={shared.fields}
        disabled={shared.disabled}
        customPath={shared.customPath}
        canGroup={depth < 2}
        onAdd={(node) => {
          keys.added();
          setFresh(isRule(node) && !NO_VALUE.has(node.op) ? group.rules.length : null);
          onChange({ ...group, rules: [...group.rules, node] });
        }}
      />
    </div>
  );
};

/**
 * Conditions as rows "Where <field> <operator> <value>", joined by "and" or "or", with nested
 * groups, on `fields`; `members` and `tags` feed their pickers. Fields and values pick from the
 * same menus as a list's filter chips. With `customPath`, a typed path is a field too.
 */
export const ConditionsEditor = ({
  value,
  onChange,
  disabled,
  fields,
  customPath,
  ...lookups
}: TConditionLookups & {
  value: TConditionGroup | undefined;
  onChange: (next: TConditionGroup | undefined) => void;
  disabled?: boolean;
  fields: TConditionField[];
  customPath?: boolean;
}) => (
  <GroupEditor
    group={value ?? { match: 'all', rules: [] }}
    fields={fields}
    lookups={lookups}
    disabled={disabled}
    customPath={customPath}
    depth={0}
    onChange={(next) => onChange(next.rules.length ? next : undefined)}
  />
);
