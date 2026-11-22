import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import { IconPlus } from '@tabler/icons-react';
import { Button, Input, Switch } from 'erxes-ui';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionFieldInput } from './ActionFieldInput';
import { appOf } from './recordSelects';
import { SplitPaths, SwitchCases } from './ArmSettings';
import { BuilderContext } from './BuilderContext';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { Field, InfoTip } from './Field';
import { emptyRequired, isEmpty } from './flowChecks';
import { actionDefaults } from './flowModel';
import type { SettingsProps } from './stepSettingsProps';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';
import { DelaySettings, WaitForSettings } from './WaitSettings';

const NameField = ({
  step,
  disabled,
  onChange,
}: Omit<SettingsProps<AutomationStep['type']>, 'subject'>) => {
  const { t } = useTranslation('automations');

  return (
    <Field label={t('step-label', 'Name on the canvas')}>
      <Input
        value={step.label ?? ''}
        disabled={disabled}
        placeholder={t('step-label-placeholder', 'Optional')}
        maxLength={80}
        onChange={(event) => onChange({ ...step, label: event.target.value || undefined })}
      />
    </Field>
  );
};

const ALWAYS_SHOWN: ReadonlySet<string> = new Set(['agent_tools', 'agent_api_key', 'agent_model']);

const NAME = '__name';

const useOptional = (step: Extract<AutomationStep, { type: 'action' }>, action: ActionInfo) => {
  const { t } = useTranslation('automations');

  const [added, setAdded] = useState(() =>
    action.fields.some((field) => field.required)
      ? new Set([
          ...action.fields.filter((field) => !isEmpty(step.input[field.key])).map(({ key }) => key),
          ...(step.label ? [NAME] : []),
        ])
      : new Set([...action.fields.map(({ key }) => key), NAME]),
  );

  const shown = action.fields.filter(
    (field) => field.required || ALWAYS_SHOWN.has(field.type) || added.has(field.key),
  );

  return {
    shown,
    nameShown: added.has(NAME),
    hidden: [
      ...action.fields.filter((field) => !shown.includes(field)),
      ...(added.has(NAME) ? [] : [{ key: NAME, label: t('step-label-short', 'Name') }]),
    ],
    add: (key: string) => setAdded((current) => new Set([...current, key])),
  };
};

const AddChips = ({
  items,
  onAdd,
}: {
  items: { key: string; label: string }[];
  onAdd: (key: string) => void;
}) =>
  items.length > 0 && (
    <div className="flex flex-wrap gap-1.5">
      {items.map(({ key, label }) => (
        <Button key={key} variant="outline" size="sm" tone="muted" onClick={() => onAdd(key)}>
          <IconPlus />
          {label}
        </Button>
      ))}
    </div>
  );

const ActionInputs = ({
  step,
  action,
  subject,
  dataFields,
  disabled,
  onChange,
}: SettingsProps<'action'> & { action: ActionInfo; dataFields: FieldInfo[] }) => {
  const dependents = (key: string): string[] =>
    action.fields
      .filter((field) =>
        key === 'connection' && appOf(action)
          ? field.type === 'plugin_record'
          : field.dependsOn === key,
      )
      .flatMap((field) => [field.key, ...dependents(field.key)]);

  const setInput = (key: string, value: unknown) =>
    onChange({
      ...step,
      input: {
        ...step.input,
        ...Object.fromEntries(dependents(key).map((dependent) => [dependent, undefined])),
        [key]: value,
      },
    });

  const empty = new Set(emptyRequired(step.input, action).map((field) => field.key));
  const optional = useOptional(step, action);

  return (
    <>
      {optional.shown.map((field) =>
        field.type === 'boolean' ? (
          <label
            key={field.key}
            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5"
          >
            <span className="flex min-w-0 items-center gap-1 text-sm">
              {field.label}
              {field.description && <InfoTip text={field.description} />}
            </span>
            <Switch
              checked={step.input[field.key] === true}
              disabled={disabled}
              onCheckedChange={(checked) => setInput(field.key, checked)}
            />
          </label>
        ) : (
          <Field
            key={field.key}
            label={field.label}
            required={field.required}
            info={field.description}
            invalid={empty.has(field.key)}
          >
            <ActionFieldInput
              action={action}
              field={field}
              subject={subject}
              value={step.input[field.key]}
              input={step.input}
              dataFields={dataFields}
              disabled={disabled}
              onChange={(value) => setInput(field.key, value)}
            />
          </Field>
        ),
      )}
      {optional.nameShown && <NameField step={step} disabled={disabled} onChange={onChange} />}
      {!disabled && <AddChips items={optional.hidden} onAdd={optional.add} />}
    </>
  );
};

const ActionSettings = ({
  actions,
  outputs,
  ...props
}: SettingsProps<'action'> & { actions: ActionInfo[]; outputs: FieldInfo[] }) => {
  const { step, subject, disabled, onChange } = props;
  const action = actions.find((item) => item.type === step.action);
  const { hasSubject, automationId } = useContext(BuilderContext);
  const { fields } = useAutomationFields(subject, automationId);

  const recordFields = hasSubject
    ? fields
    : fields.filter((field) => field.path.startsWith('event.payload.'));

  return (
    <>
      <CatalogPicker
        kind="action"
        items={actions}
        value={step.action}
        disabled={disabled}
        onChange={(type) =>
          type !== step.action &&
          onChange({
            ...step,
            action: type,
            input: actionDefaults(actions.find((item) => item.type === type)),
          })
        }
      />
      {action && (
        <ActionInputs
          key={`${step.id}:${step.action}`}
          {...props}
          action={action}
          dataFields={[...recordFields, ...outputs]}
        />
      )}
    </>
  );
};

const StepBody = ({
  actions,
  outputs,
  ...props
}: SettingsProps<AutomationStep['type']> & { actions: ActionInfo[]; outputs: FieldInfo[] }) => {
  const { t } = useTranslation('automations');
  const { step, subject, disabled, onChange } = props;
  const { hasSubject } = useContext(BuilderContext);

  switch (step.type) {
    case 'action':
      return <ActionSettings {...props} step={step} actions={actions} outputs={outputs} />;
    case 'delay':
      return <DelaySettings {...props} step={step} />;
    case 'wait_for':
      return <WaitForSettings {...props} step={step} />;
    case 'branch':
      return (
        <Field label={t('branch-if', 'Take the Yes path when')}>
          <ConditionsEditor
            subject={hasSubject ? subject : null}
            extraFields={outputs}
            value={step.conditions}
            disabled={disabled}
            onChange={(conditions) =>
              onChange({ ...step, conditions: conditions ?? { match: 'all', rules: [] } })
            }
          />
        </Field>
      );
    case 'switch':
      return <SwitchCases {...props} step={step} outputs={outputs} />;
    case 'split':
      return <SplitPaths step={step} disabled={disabled} onChange={onChange} />;
    default:
      return null;
  }
};

export const StepSettings = ({
  actions,
  ...props
}: SettingsProps<AutomationStep['type']> & { actions: ActionInfo[] }) => {
  const { outputsBefore } = useContext(BuilderContext);
  const { step, disabled, onChange } = props;

  return (
    <div className="space-y-4">
      {step.type !== 'action' && <NameField step={step} disabled={disabled} onChange={onChange} />}
      <StepBody {...props} actions={actions} outputs={outputsBefore(step.id)} />
    </div>
  );
};
