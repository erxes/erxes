import type { ActionField, ActionInfo, AutomationStep } from '@erxes/core-contract';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Label, MultipleSelector, Select, Switch, Textarea } from 'erxes-ui';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '~/lib/api';
import { ConditionsEditor } from './ConditionsEditor';
import type { FieldInfo } from './useAutomationFields';

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

/** What the builder needs everywhere: event types (for waits) and how each step did (last 30 days). */
export const BuilderContext = createContext<{
  events: { type: string; label: string }[];
  stats: Map<string, { succeeded: number; failed: number }>;
  /** Outputs of earlier steps, by the step being edited. */
  outputsBefore: (stepId: string) => FieldInfo[];
}>({ events: [], stats: new Map(), outputsBefore: () => [] });

const Units = ({ value, onChange, disabled }: { value: string; onChange: (unit: 'minutes' | 'hours' | 'days') => void; disabled?: boolean }) => {
  const { t } = useTranslation('automations');

  return (
    <Select value={value} disabled={disabled} onValueChange={(unit) => onChange(unit as 'minutes')}>
      <Select.Trigger className="w-32">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="minutes">{t('minutes', 'minutes')}</Select.Item>
        <Select.Item value="hours">{t('hours', 'hours')}</Select.Item>
        <Select.Item value="days">{t('days', 'days')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

/**
 * One step's own settings (the inspector): the action and its inputs, a
 * wait, a branch's conditions, a switch's cases, a split's paths. The steps
 * inside arms are edited on the canvas.
 */
export const StepSettings = ({
  step,
  actions,
  subject,
  disabled,
  onChange,
}: {
  step: AutomationStep;
  actions: ActionInfo[];
  subject: 'customer' | 'company';
  disabled?: boolean;
  onChange: (step: AutomationStep) => void;
}) => {
  const { t } = useTranslation('automations');
  const { events, outputsBefore } = useContext(BuilderContext);
  const outputs = outputsBefore(step.id);
  const action = step.type === 'action' ? actions.find((item) => item.type === step.action) : undefined;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('step-label', 'Name on the canvas')}</Label>
        <Input
          value={step.label ?? ''}
          disabled={disabled}
          placeholder={t('step-label-placeholder', 'Optional')}
          maxLength={80}
          onChange={(event) => onChange({ ...step, label: event.target.value || undefined })}
        />
      </div>
      {step.type === 'action' && (
        <>
          <div className="space-y-1.5">
            <Label>{t('action', 'Action')}</Label>
            <Select value={step.action} disabled={disabled} onValueChange={(type) => onChange({ ...step, action: type, input: {} })}>
              <Select.Trigger>
                <Select.Value placeholder={step.action} />
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
            {action?.description && <p className="text-xs text-muted-foreground">{action.description}</p>}
          </div>
          {action?.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
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
              {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
            </div>
          ))}
          {action?.fields.some((field) => ['text', 'longtext', 'number', 'json'].includes(field.type)) && (
          <p className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
            {t('template-hint', 'Text can use placeholders like')} <code>{'{{subject.firstName}}'}</code>, <code>{'{{event.payload.x}}'}</code>,{' '}
            <code>{'{{steps.<id>.output.x}}'}</code> — {t('template-step-id', 'this step is')} <code>{`steps.${step.id}`}</code>
          </p>
          )}
        </>
      )}
      {step.type === 'delay' && (
        <div className="space-y-1.5">
          <Label>{t('wait-for-how-long', 'Wait for')}</Label>
          <div className="flex items-center gap-2">
            <Input
              className="w-24"
              type="number"
              min={1}
              disabled={disabled}
              value={step.amount ?? 1}
              onChange={(event) => onChange({ ...step, amount: Math.max(1, Number(event.target.value) || 1), until: undefined })}
            />
            <Units value={step.unit ?? 'minutes'} disabled={disabled} onChange={(unit) => onChange({ ...step, unit })} />
          </div>
        </div>
      )}
      {step.type === 'wait_for' && (
        <>
          <div className="space-y-1.5">
            <Label>{t('wait-for-event', 'Until this happens to the record')}</Label>
            <Select value={step.event} disabled={disabled} onValueChange={(event) => onChange({ ...step, event })}>
              <Select.Trigger>
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
          </div>
          <div className="space-y-1.5">
            <Label>{t('at-most', 'For at most')}</Label>
            <div className="flex items-center gap-2">
              <Input
                className="w-24"
                type="number"
                min={1}
                disabled={disabled}
                value={step.amount}
                onChange={(event) => onChange({ ...step, amount: Math.max(1, Number(event.target.value) || 1) })}
              />
              <Units value={step.unit} disabled={disabled} onChange={(unit) => onChange({ ...step, unit })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t('only-if', 'Only if')}</Label>
            <ConditionsEditor subject={subject} value={step.conditions} disabled={disabled} onChange={(conditions) => onChange({ ...step, conditions })} />
          </div>
          <p className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
            {t('wait-for-hint', 'Later steps can check whether it happened:')} <code>{`steps.${step.id}.output.matched`}</code>
          </p>
        </>
      )}
      {step.type === 'branch' && (
        <div className="space-y-1.5">
          <Label>{t('branch-if', 'Take the Yes path when')}</Label>
          <ConditionsEditor
            subject={subject}
            extraFields={outputs}
            value={step.conditions}
            disabled={disabled}
            onChange={(conditions) => onChange({ ...step, conditions: conditions ?? { match: 'all', rules: [] } })}
          />
        </div>
      )}
      {step.type === 'switch' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{t('switch-hint', 'The first case that holds is taken; none: Otherwise.')}</p>
          {step.cases.map((item, index) => (
            <div key={index} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Input
                  className="h-8"
                  value={item.label ?? ''}
                  placeholder={t('case-n', 'Case {{n}}', { n: index + 1 })}
                  disabled={disabled}
                  onChange={(event) => onChange({ ...step, cases: step.cases.map((one, at) => (at === index ? { ...one, label: event.target.value || undefined } : one)) })}
                />
                {step.cases.length > 1 && (
                  <Button size="icon" variant="ghost" disabled={disabled} onClick={() => onChange({ ...step, cases: step.cases.filter((_, at) => at !== index) })}>
                    <IconTrash />
                  </Button>
                )}
              </div>
              <ConditionsEditor
                subject={subject}
                extraFields={outputs}
                value={item.conditions}
                disabled={disabled}
                onChange={(conditions) =>
                  onChange({ ...step, cases: step.cases.map((one, at) => (at === index ? { ...one, conditions: conditions ?? { match: 'all', rules: [] } } : one)) })
                }
              />
            </div>
          ))}
          {!disabled && step.cases.length < 10 && (
            <Button size="sm" variant="outline" onClick={() => onChange({ ...step, cases: [...step.cases, { conditions: { match: 'all', rules: [] }, steps: [] }] })}>
              <IconPlus />
              {t('add-case', 'Add case')}
            </Button>
          )}
        </div>
      )}
      {step.type === 'split' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {t('split-hint', 'Each run takes one path at random, by weight ({{total}} in all).', {
              total: step.paths.reduce((sum, path) => sum + path.weight, 0),
            })}
          </p>
          {step.paths.map((path, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                className="h-8"
                value={path.label ?? ''}
                placeholder={String.fromCharCode(65 + index)}
                disabled={disabled}
                onChange={(event) => onChange({ ...step, paths: step.paths.map((one, at) => (at === index ? { ...one, label: event.target.value || undefined } : one)) })}
              />
              <Input
                className="h-8 w-20"
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
              <span className="text-sm text-muted-foreground">%</span>
              {step.paths.length > 2 && (
                <Button size="icon" variant="ghost" disabled={disabled} onClick={() => onChange({ ...step, paths: step.paths.filter((_, at) => at !== index) })}>
                  <IconTrash />
                </Button>
              )}
            </div>
          ))}
          {!disabled && step.paths.length < 5 && (
            <Button size="sm" variant="outline" onClick={() => onChange({ ...step, paths: [...step.paths, { weight: 50, steps: [] }] })}>
              <IconPlus />
              {t('add-path', 'Add path')}
            </Button>
          )}
        </div>
      )}
      {step.type === 'stop' && <p className="text-sm text-muted-foreground">{t('stop-hint', 'The run ends here, even if steps follow.')}</p>}
    </div>
  );
};
