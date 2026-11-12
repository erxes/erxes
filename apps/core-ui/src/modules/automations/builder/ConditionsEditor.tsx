import { CONDITION_OPERATORS, type ConditionGroup, type ConditionRule } from '@erxes/core-contract';
import { IconBraces, IconPlus, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, cn, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { api } from '~/lib/api';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';

const OPERATOR_LABELS: Record<(typeof CONDITION_OPERATORS)[number], string> = {
  eq: 'is',
  neq: 'is not',
  gt: 'is greater than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  contains: 'contains',
  not_contains: "doesn't contain",
  starts_with: 'starts with',
  in: 'is one of',
  not_in: 'is none of',
  exists: 'is set',
  not_exists: 'is empty',
  within_last: 'in the last',
  more_than_ago: 'more than … ago',
  within_next: 'in the next',
  anniversary_within: 'anniversary in the next',
};

/** Operators that make sense for a field's type. */
const operatorsFor = (type: string | undefined) => {
  if (type === 'date') {
    return ['within_last', 'more_than_ago', 'within_next', 'anniversary_within', 'eq', 'gt', 'lt', 'exists', 'not_exists'] as const;
  }
  if (type === 'number') return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'exists', 'not_exists'] as const;
  if (type === 'tags' || type === 'list') return ['contains', 'not_contains', 'exists', 'not_exists'] as const;
  if (type === 'boolean') return ['eq', 'neq'] as const;
  if (type === 'select' || type === 'member') return ['eq', 'neq', 'in', 'not_in', 'exists', 'not_exists'] as const;

  return CONDITION_OPERATORS;
};

const NO_VALUE = new Set(['exists', 'not_exists']);
const RELATIVE = new Set(['within_last', 'more_than_ago', 'within_next', 'anniversary_within']);
const GROUP_LABELS: Record<string, string> = { fields: 'Fields', custom: 'Properties', company: 'Company', activity: 'Activity' };
const LIST_VALUE = new Set(['in', 'not_in']);

const isRule = (rule: ConditionRule | ConditionGroup): rule is ConditionRule => !('match' in rule);

const CUSTOM_PATH = '__custom__';

/** A field from the catalog, or any path typed by hand (`event.payload.amount`, `steps.x.output.y`). */
const PathPicker = ({ value, fields, onChange, disabled }: { value: string; fields: FieldInfo[]; onChange: (path: string) => void; disabled?: boolean }) => {
  const { t } = useTranslation('automations');
  const known = fields.some((field) => field.path === value);

  return (
    <div className="flex gap-1">
      <Select value={known ? value : CUSTOM_PATH} onValueChange={(path) => onChange(path === CUSTOM_PATH ? '' : path)} disabled={disabled}>
        <Select.Trigger className="h-8 w-48">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {fields.some((field) => field.group)
            ? [...new Set(fields.map((field) => field.group ?? 'fields'))].map((group) => (
                <Select.Group key={group}>
                  <Select.Label className="text-xs text-muted-foreground">{t(`field-group.${group}`, GROUP_LABELS[group] ?? group)}</Select.Label>
                  {fields
                    .filter((field) => (field.group ?? 'fields') === group)
                    .map((field) => (
                      <Select.Item key={field.path} value={field.path}>
                        {field.label}
                      </Select.Item>
                    ))}
                </Select.Group>
              ))
            : fields.map((field) => (
                <Select.Item key={field.path} value={field.path}>
                  {field.label}
                </Select.Item>
              ))}
          {!fields.some((field) => field.group) && <Select.Item value={CUSTOM_PATH}>{t('custom-path', 'Another value…')}</Select.Item>}
        </Select.Content>
      </Select>
      {!known && (
        <Input
          className="h-8 w-48 font-mono text-xs"
          placeholder="event.payload.amount"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
};

const useMembers = (enabled: boolean) =>
  useQuery({
    queryKey: ['conditions', 'members'],
    queryFn: async () => (await api.users.list({ limit: 100 })).data.map((user) => ({ value: user.id, label: user.fullName || user.email })),
    staleTime: 60_000,
    enabled,
  }).data ?? [];

const useTags = (type: 'customer' | 'company', enabled: boolean) =>
  useQuery({
    queryKey: ['conditions', 'tags', type],
    queryFn: async () => (await api.tags.list({ type })).data.map((tag) => ({ value: tag.id, label: tag.name })),
    staleTime: 60_000,
    enabled,
  }).data ?? [];

const ValueInput = ({
  rule,
  field,
  onChange,
  disabled,
  subject,
}: {
  rule: ConditionRule;
  field?: FieldInfo;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  subject: 'customer' | 'company' | null;
}) => {
  const { t } = useTranslation('automations');
  const members = useMembers(field?.type === 'member');
  const tags = useTags(subject ?? 'customer', field?.type === 'tags');

  if (RELATIVE.has(rule.op)) {
    const current = (rule.value ?? {}) as { amount?: number; unit?: string };

    return (
      <div className="flex items-center gap-1">
        <Input
          className="h-8 w-20"
          type="number"
          min={0}
          disabled={disabled}
          value={current.amount ?? ''}
          onChange={(event) => onChange({ unit: 'days', ...current, amount: Math.max(0, Number(event.target.value) || 0) })}
        />
        {rule.op === 'anniversary_within' ? (
          <span className="text-sm text-muted-foreground">{t('days', 'days')}</span>
        ) : (
          <Select value={current.unit ?? 'days'} disabled={disabled} onValueChange={(unit) => onChange({ amount: 0, ...current, unit })}>
            <Select.Trigger className="h-8 w-28">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="days">{t('days', 'days')}</Select.Item>
              <Select.Item value="weeks">{t('weeks', 'weeks')}</Select.Item>
              <Select.Item value="months">{t('months', 'months')}</Select.Item>
            </Select.Content>
          </Select>
        )}
      </div>
    );
  }

  if ((field?.type === 'member' || field?.type === 'tags') && !LIST_VALUE.has(rule.op)) {
    const options = field.type === 'member' ? [{ value: 'me', label: t('me', 'Me') }, ...members] : tags;

    return (
      <Select value={String(rule.value ?? '')} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger className="h-8 w-48">
          <Select.Value placeholder={t('choose', 'Choose…')} />
        </Select.Trigger>
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  if (LIST_VALUE.has(rule.op)) {
    return (
      <Input
        className="h-8 w-56"
        disabled={disabled}
        placeholder={t('list-placeholder', 'a, b, c')}
        value={Array.isArray(rule.value) ? rule.value.join(', ') : String(rule.value ?? '')}
        onChange={(event) => onChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
      />
    );
  }

  if (field?.type === 'boolean') {
    return (
      <Select value={String(rule.value ?? 'true')} onValueChange={(value) => onChange(value === 'true')} disabled={disabled}>
        <Select.Trigger className="h-8 w-28">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="true">{t('yes', 'yes')}</Select.Item>
          <Select.Item value="false">{t('no', 'no')}</Select.Item>
        </Select.Content>
      </Select>
    );
  }

  if (field?.options?.length) {
    return (
      <Select value={String(rule.value ?? '')} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger className="h-8 w-44">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {field.options.map((option) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  return (
    <Input
      className="h-8 w-56"
      type={field?.type === 'date' ? 'date' : field?.type === 'number' ? 'number' : 'text'}
      disabled={disabled}
      placeholder={t('value-placeholder', 'value')}
      value={String(rule.value ?? '')}
      onChange={(event) => onChange(field?.type === 'number' ? Number(event.target.value) : event.target.value)}
    />
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
  subject: 'customer' | 'company' | null;
}) => {
  const { t } = useTranslation('automations');
  const update = (index: number, rule: ConditionRule | ConditionGroup) => onChange({ ...group, rules: group.rules.map((item, at) => (at === index ? rule : item)) });
  const remove = (index: number) => onChange({ ...group, rules: group.rules.filter((_, at) => at !== index) });

  return (
    <div className={cn('space-y-2', depth > 0 && 'rounded-md border border-dashed p-2')}>
      <div className="flex items-center gap-2 text-sm">
        <span>{t('match-prefix', 'Match')}</span>
        <Select value={group.match} onValueChange={(match) => onChange({ ...group, match: match as 'all' | 'any' })} disabled={disabled}>
          <Select.Trigger className="h-7 w-24">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">{t('match-all', 'all')}</Select.Item>
            <Select.Item value="any">{t('match-any', 'any')}</Select.Item>
          </Select.Content>
        </Select>
        <span>{t('match-suffix', 'of these')}</span>
        {onRemove && (
          <Button size="sm" variant="ghost" className="ml-auto" disabled={disabled} onClick={onRemove}>
            <IconX />
          </Button>
        )}
      </div>
      {group.rules.map((rule, index) =>
        isRule(rule) ? (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <PathPicker value={rule.path} fields={fields} disabled={disabled} onChange={(path) => update(index, { ...rule, path })} />
            <Select
              value={rule.op}
              onValueChange={(op) =>
                update(index, {
                  ...rule,
                  op: op as ConditionRule['op'],
                  // A relative date takes { amount, unit }; leaving one drops it.
                  value: RELATIVE.has(op) ? (RELATIVE.has(rule.op) ? rule.value : { amount: 30, unit: 'days' }) : RELATIVE.has(rule.op) ? undefined : rule.value,
                })
              }
              disabled={disabled}
            >
              <Select.Trigger className="h-8 w-40">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {operatorsFor(fields.find((field) => field.path === rule.path)?.type).map((op) => (
                  <Select.Item key={op} value={op}>
                    {t(`op.${op}`, OPERATOR_LABELS[op])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {!NO_VALUE.has(rule.op) && (
              <ValueInput
                rule={rule}
                field={fields.find((field) => field.path === rule.path)}
                disabled={disabled}
                subject={subject}
                onChange={(value) => update(index, { ...rule, value })}
              />
            )}
            <Button size="sm" variant="ghost" disabled={disabled} onClick={() => remove(index)}>
              <IconX />
            </Button>
          </div>
        ) : (
          <GroupEditor
            key={index}
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
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onChange({ ...group, rules: [...group.rules, { path: fields[3]?.path ?? 'subject.primaryEmail', op: 'exists' }] })}
        >
          <IconPlus />
          {t('add-condition', 'Add condition')}
        </Button>
        {depth < 2 && (
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => onChange({ ...group, rules: [...group.rules, { match: group.match === 'all' ? 'any' : 'all', rules: [] }] })}
          >
            <IconBraces />
            {t('add-group', 'Add group')}
          </Button>
        )}
      </div>
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
  subject?: 'customer' | 'company' | null;
  /** Outputs of earlier steps, offered next to the record's fields. */
  extraFields?: FieldInfo[];
  /** Instead of the automation catalog (a list's advanced filter gives its own, grouped). */
  fields?: FieldInfo[];
}) => {
  const loaded = useAutomationFields(given ? null : subject);
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
