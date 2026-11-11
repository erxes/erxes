import type { ActionField, ActionInfo, AutomationStep } from '@erxes/core-contract';
import {
  IconArrowDown,
  IconArrowUp,
  IconBolt,
  IconClock,
  IconGitBranch,
  IconHandStop,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, cn, DropdownMenu, Input, Label, MultipleSelector, Select, Switch, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { api } from '~/lib/api';
import { ConditionsEditor } from './ConditionsEditor';

const newStepId = () => Math.random().toString(36).slice(2, 10);

const useMemberOptions = () =>
  useQuery({
    queryKey: ['automations', 'member-options'],
    queryFn: async () =>
      (await api.users.list({ limit: 100 })).data.map((user) => ({ value: user.id, label: user.fullName || user.email })),
    staleTime: 60_000,
  }).data ?? [];

const useTagOptions = (type: 'customer' | 'company') =>
  useQuery({
    queryKey: ['automations', 'tag-options', type],
    queryFn: async () => (await api.tags.list({ type })).data.map((tag) => ({ value: tag.id, label: tag.name })),
    staleTime: 60_000,
  }).data ?? [];

const asList = (value: unknown) => (Array.isArray(value) ? value.map(String) : value ? [String(value)] : []);

/** One input of an action, by its declared type. Text accepts {{placeholders}}. */
const FieldInput = ({
  field,
  value,
  onChange,
  disabled,
  subject,
}: {
  field: ActionField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  subject: 'customer' | 'company';
}) => {
  const members = useMemberOptions();
  const tags = useTagOptions(subject);

  switch (field.type) {
    case 'longtext':
      return <Textarea rows={3} value={String(value ?? '')} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
    case 'number':
      return <Input type="text" value={String(value ?? '')} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
    case 'boolean':
      return <Switch checked={value === true} disabled={disabled} onCheckedChange={(checked) => onChange(checked)} />;
    case 'select':
      return (
        <Select value={String(value ?? '')} onValueChange={onChange} disabled={disabled}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {(field.options ?? []).map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      );
    case 'members':
    case 'tags': {
      const options = field.type === 'members' ? members : tags;

      return (
        <MultipleSelector
          value={asList(value).map((id) => options.find((option) => option.value === id) ?? { value: id, label: id })}
          onChange={(next) => onChange(next.map((option) => option.value))}
          defaultOptions={options}
          options={options}
          disabled={disabled}
          hidePlaceholderWhenSelected
        />
      );
    }
    case 'json':
      return (
        <Textarea
          rows={4}
          className="font-mono text-xs"
          disabled={disabled}
          defaultValue={value === undefined ? '' : JSON.stringify(value, null, 2)}
          onBlur={(event) => {
            try {
              onChange(event.target.value.trim() ? JSON.parse(event.target.value) : undefined);
            } catch {
              // Kept as typed until it's valid JSON.
            }
          }}
        />
      );
    default:
      return <Input value={String(value ?? '')} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
  }
};

const STEP_ICONS = { action: IconBolt, delay: IconClock, branch: IconGitBranch, stop: IconHandStop } as const;

const StepCard = ({
  step,
  actions,
  subject,
  disabled,
  onChange,
  onRemove,
  onMove,
}: {
  step: AutomationStep;
  actions: ActionInfo[];
  subject: 'customer' | 'company';
  disabled?: boolean;
  onChange: (step: AutomationStep) => void;
  onRemove: () => void;
  onMove: (delta: -1 | 1) => void;
}) => {
  const { t } = useTranslation('automations');
  const Icon = STEP_ICONS[step.type];
  const action = step.type === 'action' ? actions.find((item) => item.type === step.action) : undefined;

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Icon className="size-4 text-primary" />
        <span className="text-sm font-medium">
          {step.type === 'action'
            ? (action?.label ?? step.action)
            : step.type === 'delay'
              ? t('delay', 'Wait')
              : step.type === 'branch'
                ? t('branch', 'If / else')
                : t('stop', 'Stop')}
        </span>
        {action && action.source !== 'core' && <span className="text-xs text-muted-foreground">· {action.source}</span>}
        <span className="ml-auto flex gap-1">
          <Button size="sm" variant="ghost" disabled={disabled} onClick={() => onMove(-1)}>
            <IconArrowUp />
          </Button>
          <Button size="sm" variant="ghost" disabled={disabled} onClick={() => onMove(1)}>
            <IconArrowDown />
          </Button>
          <Button size="sm" variant="ghost" disabled={disabled} onClick={onRemove}>
            <IconTrash />
          </Button>
        </span>
      </div>
      <div className="space-y-3 p-3">
        {step.type === 'action' && (
          <>
            <Select
              value={step.action}
              disabled={disabled}
              onValueChange={(type) => onChange({ ...step, action: type, input: {} })}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {actions.map((item) => (
                  <Select.Item key={item.type} value={item.type}>
                    {item.label}
                    {item.source !== 'core' ? ` (${item.source})` : ''}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {action?.fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label>
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </Label>
                <FieldInput
                  field={field}
                  subject={subject}
                  value={step.input[field.key]}
                  disabled={disabled}
                  onChange={(value) => onChange({ ...step, input: { ...step.input, [field.key]: value } })}
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              {t('template-hint', 'Text can use placeholders like')}{' '}
              <code>{'{{subject.firstName}}'}</code>, <code>{'{{event.payload.x}}'}</code>, <code>{'{{steps.<id>.output.x}}'}</code>
            </p>
          </>
        )}
        {step.type === 'delay' && (
          <div className="flex items-center gap-2">
            <Input
              className="w-24"
              type="number"
              min={1}
              disabled={disabled}
              value={step.amount ?? 1}
              onChange={(event) => onChange({ ...step, amount: Math.max(1, Number(event.target.value) || 1), until: undefined })}
            />
            <Select value={step.unit ?? 'minutes'} disabled={disabled} onValueChange={(unit) => onChange({ ...step, unit: unit as 'minutes' })}>
              <Select.Trigger className="w-32">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="minutes">{t('minutes', 'minutes')}</Select.Item>
                <Select.Item value="hours">{t('hours', 'hours')}</Select.Item>
                <Select.Item value="days">{t('days', 'days')}</Select.Item>
              </Select.Content>
            </Select>
          </div>
        )}
        {step.type === 'branch' && (
          <>
            <ConditionsEditor
              value={step.conditions}
              disabled={disabled}
              onChange={(conditions) => onChange({ ...step, conditions: conditions ?? { match: 'all', rules: [] } })}
            />
            <div className="grid gap-3 md:grid-cols-2">
              {(['then', 'else'] as const).map((arm) => (
                <div key={arm} className="rounded-md bg-muted/40 p-2">
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    {arm === 'then' ? t('then', 'If it matches') : t('else', 'Otherwise')}
                  </p>
                  <StepsEditor
                    steps={step[arm]}
                    actions={actions}
                    subject={subject}
                    disabled={disabled}
                    onChange={(steps) => onChange({ ...step, [arm]: steps })}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/** A list of steps (recursive inside branches), with "add step" at the end. */
export const StepsEditor = ({
  steps,
  actions,
  subject,
  disabled,
  onChange,
}: {
  steps: AutomationStep[];
  actions: ActionInfo[];
  subject: 'customer' | 'company';
  disabled?: boolean;
  onChange: (steps: AutomationStep[]) => void;
}) => {
  const { t } = useTranslation('automations');
  const add = (type: AutomationStep['type']) => {
    const id = newStepId();
    const firstAction = actions.find((item) => item.subject === null || item.subject === 'any' || item.subject === subject) ?? actions[0];
    const step: AutomationStep =
      type === 'action'
        ? { id, type, action: firstAction?.type ?? 'core.note.add', input: {} }
        : type === 'delay'
          ? { id, type, amount: 1, unit: 'hours' }
          : type === 'branch'
            ? { id, type, conditions: { match: 'all', rules: [] }, then: [], else: [] }
            : { id, type };

    onChange([...steps, step]);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={step.id} className={cn(index > 0 && 'border-l-2 border-dashed pl-0')}>
          <StepCard
            step={step}
            actions={actions}
            subject={subject}
            disabled={disabled}
            onChange={(next) => onChange(steps.map((item, at) => (at === index ? next : item)))}
            onRemove={() => onChange(steps.filter((_, at) => at !== index))}
            onMove={(delta) => {
              const target = index + delta;

              if (target < 0 || target >= steps.length) return;

              const next = [...steps];

              [next[index], next[target]] = [next[target]!, next[index]!];
              onChange(next);
            }}
          />
        </div>
      ))}
      {!disabled && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button size="sm" variant="outline">
              <IconPlus />
              {t('add-step', 'Add step')}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            <DropdownMenu.Item onClick={() => add('action')}>
              <IconBolt />
              {t('action', 'Action')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => add('delay')}>
              <IconClock />
              {t('delay', 'Wait')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => add('branch')}>
              <IconGitBranch />
              {t('branch', 'If / else')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => add('stop')}>
              <IconHandStop />
              {t('stop', 'Stop')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </div>
  );
};
