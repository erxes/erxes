import type { ActionField, ActionInfo, AutomationStep } from '@erxes/core-contract';
import { IconAt, IconBuilding, IconPlus, IconTrash, IconUser } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, MultipleSelector, Select, Switch, Textarea } from 'erxes-ui';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '~/lib/api';
import { useStageName } from '~/modules/leads/i18n';
import { useLeadStages } from '~/modules/leads/useLeads';
import { ConditionsEditor } from './ConditionsEditor';
import { FieldLabel } from './FieldLabel';
import { CatalogPicker } from './CatalogPicker';
import { Segmented } from './Segmented';
import { TemplateInput } from './TemplateInput';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';
import { actionDefaults } from './flowModel';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';

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

const fieldIdOf = (path: string) => path.replace('subject.customFields.', '');

/** One input of an action, by its declared type. Text takes data from the run through "Insert data". */
const FieldInput = ({
  field,
  value,
  input,
  onChange,
  disabled,
  subject,
  dataFields,
}: {
  field: ActionField;
  value: unknown;
  /** The step's other inputs (a value follows the custom field chosen in another). */
  input: Record<string, unknown>;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  subject: 'customer' | 'company';
  dataFields: FieldInfo[];
}) => {
  const { t } = useTranslation('automations');
  const members = useMemberOptions();
  const tags = useTagOptions(subject);
  const { stages } = useLeadStages();
  const stageName = useStageName();
  const customFields = dataFields.filter((item) => item.path.startsWith('subject.customFields.'));
  const text = (multiline?: boolean) => (
    <TemplateInput
      value={String(value ?? '')}
      onChange={onChange}
      fields={dataFields}
      subject={subject}
      multiline={multiline}
      placeholder={field.placeholder}
      disabled={disabled}
    />
  );

  // A value for the custom field chosen in another input: shaped like that field.
  if (field.sameTypeAs) {
    const chosen = customFields.find((item) => fieldIdOf(item.path) === input[field.sameTypeAs!]);

    if (chosen?.type === 'date') {
      return <Input type="date" value={String(value ?? '')} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
    }

    if (chosen?.type === 'boolean' || (chosen?.type === 'select' && chosen.options?.length)) {
      const options = chosen.type === 'boolean' ? [{ value: 'true', label: t('yes', 'Yes') }, { value: 'false', label: t('no', 'No') }] : chosen.options!.map((option) => ({ value: option, label: option }));

      return (
        <Select value={value === undefined || value === '' ? '__clear' : String(value)} disabled={disabled} onValueChange={(next) => onChange(next === '__clear' ? '' : chosen.type === 'boolean' ? next === 'true' : next)}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="__clear">
              <span className="text-muted-foreground">{t('clear-value', 'Clear the field')}</span>
            </Select.Item>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      );
    }

    return text();
  }

  switch (field.type) {
    case 'longtext':
      return text(true);
    case 'text':
    case 'number':
      return text();
    case 'date':
      return <Input type="date" value={String(value ?? '')} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
    case 'boolean':
      return <Switch checked={value === true} disabled={disabled} onCheckedChange={(checked) => onChange(checked)} />;
    case 'recipients': {
      // `subject`: the record's own email; anything else (even empty, while typing): addresses.
      const toRecord = value === undefined || value === 'subject';
      const addresses = toRecord ? '' : String(value);

      return (
        <div className="space-y-2">
          <Segmented
            value={toRecord ? 'record' : 'addresses'}
            disabled={disabled}
            onChange={(next) => onChange(next === 'record' ? 'subject' : '')}
            options={[
              { value: 'record', label: subject === 'company' ? t('to-company-email', "The company's email") : t('to-customer-email', "The customer's email"), icon: subject === 'company' ? IconBuilding : IconUser },
              { value: 'addresses', label: t('to-addresses', 'Other addresses'), icon: IconAt },
            ]}
          />
          {!toRecord ? (
            <TemplateInput
              value={addresses}
              onChange={onChange}
              fields={dataFields}
              subject={subject}
              placeholder="name@example.com, other@example.com"
              disabled={disabled}
            />
          ) : null}
        </div>
      );
    }
    case 'custom_field':
      return customFields.length ? (
        <Select value={String(value ?? '')} disabled={disabled} onValueChange={onChange}>
          <Select.Trigger>
            <Select.Value placeholder={t('choose-field', 'Choose a field')} />
          </Select.Trigger>
          <Select.Content>
            {customFields.map((item) => (
              <Select.Item key={item.path} value={fieldIdOf(item.path)}>
                {item.label.replace(/ \(custom\)$/, '')}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      ) : (
        <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          {t('no-custom-fields', 'No custom fields yet.')}{' '}
          <Link to={CONTACT_SETTINGS.properties} className="text-primary hover:underline">
            {t('add-in-properties', 'Add one in Properties')}
          </Link>
        </p>
      );
    case 'lead_stage': {
      // Saved by id; older steps saved the stage's name.
      const current = stages.find((stage) => stage.id === value || stage.name.toLowerCase() === String(value ?? '').toLowerCase());

      return (
        <Select value={current?.id ?? ''} disabled={disabled} onValueChange={onChange}>
          <Select.Trigger>
            <Select.Value placeholder={t('choose-stage', 'Choose a stage')} />
          </Select.Trigger>
          <Select.Content>
            {stages.map((stage) => (
              <Select.Item key={stage.id} value={stage.id}>
                <span className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: stage.color }} />
                  {stageName(stage.name)}
                </span>
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      );
    }
    case 'select':
      return (
        <Select value={String(value ?? '')} onValueChange={onChange} disabled={disabled}>
          <Select.Trigger>
            <Select.Value placeholder={t('choose', 'Choose…')} />
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
          placeholder={field.type === 'members' ? t('choose-members', 'Choose members…') : t('choose-tags', 'Choose tags…')}
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
          placeholder={field.placeholder}
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
      return text();
  }
};

/** What the builder needs everywhere: event types (for waits) and how each step did (last 30 days). */
export const BuilderContext = createContext<{
  events: { type: string; label: string; description?: string | null; source: string }[];
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
  const recordFields = useAutomationFields(subject);
  const dataFields = [...recordFields, ...outputs];

  const nameField = (
    <div className="space-y-1.5">
      <FieldLabel>{t('step-label', 'Name on the canvas')}</FieldLabel>
      <Input
        value={step.label ?? ''}
        disabled={disabled}
        placeholder={t('step-label-placeholder', 'Optional')}
        maxLength={80}
        onChange={(event) => onChange({ ...step, label: event.target.value || undefined })}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {step.type !== 'action' && nameField}
      {step.type === 'action' && (
        <>
          <div className="space-y-1.5">
            <FieldLabel>{t('action', 'Action')}</FieldLabel>
            <CatalogPicker
              kind="action"
              items={actions}
              value={step.action}
              disabled={disabled}
              onChange={(type) =>
                type !== step.action &&
                onChange({ ...step, action: type, input: actionDefaults(actions.find((item) => item.type === type)) })
              }
            />
            {action?.description && <p className="text-xs text-muted-foreground">{action.description}</p>}
          </div>
          {action && action.fields.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              {action.fields.map((field) =>
                field.type === 'boolean' ? (
                  <label key={field.key} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-sm">{field.label}</span>
                      {field.description && <span className="block text-xs text-muted-foreground">{field.description}</span>}
                    </span>
                    <Switch
                      checked={step.input[field.key] === true}
                      disabled={disabled}
                      onCheckedChange={(checked) => onChange({ ...step, input: { ...step.input, [field.key]: checked } })}
                    />
                  </label>
                ) : (
                  <div key={field.key} className="space-y-1.5">
                    <FieldLabel>
                      {field.label}
                      {field.required && <span className="text-destructive"> *</span>}
                    </FieldLabel>
                    <FieldInput
                      field={field}
                      subject={subject}
                      value={step.input[field.key]}
                      input={step.input}
                      dataFields={dataFields}
                      disabled={disabled}
                      onChange={(value) => onChange({ ...step, input: { ...step.input, [field.key]: value } })}
                    />
                    {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                  </div>
                ),
              )}
            </div>
          )}
          <div className="border-t pt-4">{nameField}</div>
        </>
      )}
      {step.type === 'delay' && (
        <div className="space-y-1.5">
          <FieldLabel>{t('wait-for-how-long', 'Wait for')}</FieldLabel>
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
            <FieldLabel>{t('wait-for-event', 'Until this happens to the record')}</FieldLabel>
            <CatalogPicker kind="event" items={events} value={step.event} disabled={disabled} onChange={(event) => onChange({ ...step, event })} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>{t('at-most', 'For at most')}</FieldLabel>
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
            <FieldLabel>{t('only-if', 'Only if')}</FieldLabel>
            <ConditionsEditor subject={subject} value={step.conditions} disabled={disabled} onChange={(conditions) => onChange({ ...step, conditions })} />
          </div>
          <p className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
            {t('wait-for-hint', 'Later steps can check whether it happened:')} <code>{`steps.${step.id}.output.matched`}</code>
          </p>
        </>
      )}
      {step.type === 'branch' && (
        <div className="space-y-1.5">
          <FieldLabel>{t('branch-if', 'Take the Yes path when')}</FieldLabel>
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
