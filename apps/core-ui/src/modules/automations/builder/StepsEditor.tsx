import type { ActionField, ActionInfo, AutomationStep } from '@erxes/core-contract';
import {
  IconArrowDown,
  IconArrowsSplit,
  IconArrowUp,
  IconBolt,
  IconClock,
  IconGitBranch,
  IconHandStop,
  IconHourglass,
  IconPlus,
  IconRoute,
  IconTrash,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, cn, DropdownMenu, Input, Label, MultipleSelector, Select, Switch, Textarea } from 'erxes-ui';
import { createContext, useContext } from 'react';
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

const STEP_ICONS = {
  action: IconBolt,
  delay: IconClock,
  wait_for: IconHourglass,
  branch: IconGitBranch,
  switch: IconRoute,
  split: IconArrowsSplit,
  stop: IconHandStop,
} as const;

/** What the builder needs everywhere: event types (for waits) and how each step did (last 30 days). */
export const BuilderContext = createContext<{
  events: { type: string; label: string }[];
  stats: Map<string, { succeeded: number; failed: number }>;
}>({ events: [], stats: new Map() });

/** One arm of a branching step, as a column. */
const Arm = ({
  title,
  steps,
  onChange,
  actions,
  subject,
  disabled,
  extra,
}: {
  title: React.ReactNode;
  steps: AutomationStep[];
  onChange: (steps: AutomationStep[]) => void;
  actions: ActionInfo[];
  subject: 'customer' | 'company';
  disabled?: boolean;
  extra?: React.ReactNode;
}) => (
  <div className="min-w-56 flex-1 rounded-md bg-muted/40 p-2">
    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">{title}</div>
    {extra}
    <StepsEditor steps={steps} actions={actions} subject={subject} disabled={disabled} onChange={onChange} />
  </div>
);

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
  const { events, stats } = useContext(BuilderContext);
  const Icon = STEP_ICONS[step.type];
  const counts = stats.get(step.id);
  const action = step.type === 'action' ? actions.find((item) => item.type === step.action) : undefined;

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Icon className="size-4 text-primary" />
        <span className="text-sm font-medium">
          {step.type === 'action'
            ? (action?.label ?? step.action)
            : {
                delay: t('delay', 'Wait'),
                wait_for: t('wait-for', 'Wait for an event'),
                branch: t('branch', 'If / else'),
                switch: t('switch', 'Choose a path'),
                split: t('split', 'A/B split'),
                stop: t('stop', 'Stop'),
              }[step.type]}
        </span>
        {counts && (
          <span className="text-xs text-muted-foreground">
            {t('step-counts', '{{succeeded}} done', { succeeded: counts.succeeded })}
            {counts.failed > 0 && <span className="text-destructive"> · {t('step-failed', '{{failed}} failed', { failed: counts.failed })}</span>}
          </span>
        )}
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
        {step.type === 'wait_for' && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Select value={step.event} disabled={disabled} onValueChange={(event) => onChange({ ...step, event })}>
              <Select.Trigger className="w-64">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {events.map((event) => (
                  <Select.Item key={event.type} value={event.type}>
                    {event.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <span>{t('at-most', 'for at most')}</span>
            <Input
              className="w-20"
              type="number"
              min={1}
              disabled={disabled}
              value={step.amount}
              onChange={(event) => onChange({ ...step, amount: Math.max(1, Number(event.target.value) || 1) })}
            />
            <Select value={step.unit} disabled={disabled} onValueChange={(unit) => onChange({ ...step, unit: unit as 'hours' })}>
              <Select.Trigger className="w-28">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="minutes">{t('minutes', 'minutes')}</Select.Item>
                <Select.Item value="hours">{t('hours', 'hours')}</Select.Item>
                <Select.Item value="days">{t('days', 'days')}</Select.Item>
              </Select.Content>
            </Select>
            <p className="w-full text-xs text-muted-foreground">
              {t('wait-for-hint', 'Later steps can check whether it happened:')} <code>{`steps.${step.id}.output.matched`}</code>
            </p>
            <div className="w-full">
              <ConditionsEditor
                subject={subject}
                value={step.conditions}
                disabled={disabled}
                onChange={(conditions) => onChange({ ...step, conditions })}
              />
            </div>
          </div>
        )}
        {step.type === 'switch' && (
          <div className="flex flex-wrap gap-3">
            {step.cases.map((item, index) => (
              <Arm
                key={index}
                title={
                  <>
                    <Input
                      className="h-7 w-32 text-xs"
                      value={item.label ?? ''}
                      placeholder={t('case-n', 'Case {{n}}', { n: index + 1 })}
                      disabled={disabled}
                      onChange={(event) =>
                        onChange({ ...step, cases: step.cases.map((one, at) => (at === index ? { ...one, label: event.target.value } : one)) })
                      }
                    />
                    {step.cases.length > 1 && (
                      <Button size="sm" variant="ghost" disabled={disabled} onClick={() => onChange({ ...step, cases: step.cases.filter((_, at) => at !== index) })}>
                        <IconTrash />
                      </Button>
                    )}
                  </>
                }
                extra={
                  <div className="mb-2">
                    <ConditionsEditor
                      subject={subject}
                      value={item.conditions}
                      disabled={disabled}
                      onChange={(conditions) =>
                        onChange({
                          ...step,
                          cases: step.cases.map((one, at) => (at === index ? { ...one, conditions: conditions ?? { match: 'all', rules: [] } } : one)),
                        })
                      }
                    />
                  </div>
                }
                steps={item.steps}
                actions={actions}
                subject={subject}
                disabled={disabled}
                onChange={(steps) => onChange({ ...step, cases: step.cases.map((one, at) => (at === index ? { ...one, steps } : one)) })}
              />
            ))}
            <Arm
              title={t('otherwise', 'Otherwise')}
              steps={step.otherwise}
              actions={actions}
              subject={subject}
              disabled={disabled}
              onChange={(otherwise) => onChange({ ...step, otherwise })}
            />
            {!disabled && step.cases.length < 10 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onChange({ ...step, cases: [...step.cases, { conditions: { match: 'all', rules: [] }, steps: [] }] })}
              >
                <IconPlus />
                {t('add-case', 'Add case')}
              </Button>
            )}
          </div>
        )}
        {step.type === 'split' && (
          <div className="flex flex-wrap gap-3">
            {step.paths.map((path, index) => (
              <Arm
                key={index}
                title={
                  <>
                    <Input
                      className="h-7 w-20 text-xs"
                      value={path.label ?? ''}
                      placeholder={String.fromCharCode(65 + index)}
                      disabled={disabled}
                      onChange={(event) => onChange({ ...step, paths: step.paths.map((one, at) => (at === index ? { ...one, label: event.target.value } : one)) })}
                    />
                    <Input
                      className="h-7 w-16 text-xs"
                      type="number"
                      min={1}
                      max={100}
                      value={path.weight}
                      disabled={disabled}
                      onChange={(event) =>
                        onChange({
                          ...step,
                          paths: step.paths.map((one, at) => (at === index ? { ...one, weight: Math.min(100, Math.max(1, Number(event.target.value) || 1)) } : one)),
                        })
                      }
                    />
                    <span>%</span>
                  </>
                }
                steps={path.steps}
                actions={actions}
                subject={subject}
                disabled={disabled}
                onChange={(steps) => onChange({ ...step, paths: step.paths.map((one, at) => (at === index ? { ...one, steps } : one)) })}
              />
            ))}
            {!disabled && step.paths.length < 5 && (
              <Button size="sm" variant="outline" onClick={() => onChange({ ...step, paths: [...step.paths, { weight: 50, steps: [] }] })}>
                <IconPlus />
                {t('add-path', 'Add path')}
              </Button>
            )}
          </div>
        )}
        {step.type === 'branch' && (
          <>
            <ConditionsEditor
              subject={subject}
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
            : type === 'wait_for'
              ? { id, type, event: 'core.customer.updated', amount: 3, unit: 'days' }
              : type === 'switch'
                ? { id, type, cases: [{ conditions: { match: 'all', rules: [] }, steps: [] }], otherwise: [] }
                : type === 'split'
                  ? { id, type, paths: [{ label: 'A', weight: 50, steps: [] }, { label: 'B', weight: 50, steps: [] }] }
                  : { id, type: 'stop' };

    onChange([...steps, step]);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {index > 0 && <div className="mx-auto -mt-2 mb-0 h-3 w-px bg-border" aria-hidden />}
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
            <DropdownMenu.Item onClick={() => add('wait_for')}>
              <IconHourglass />
              {t('wait-for', 'Wait for an event')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => add('branch')}>
              <IconGitBranch />
              {t('branch', 'If / else')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => add('switch')}>
              <IconRoute />
              {t('switch', 'Choose a path')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => add('split')}>
              <IconArrowsSplit />
              {t('split', 'A/B split')}
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
