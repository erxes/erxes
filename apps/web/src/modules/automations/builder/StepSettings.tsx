import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import { Input, Switch } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionFieldInput } from './ActionFieldInput';
import { SplitPaths, SwitchCases } from './ArmSettings';
import { BuilderContext } from './BuilderContext';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { FieldLabel } from './FieldLabel';
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
};

/** The chosen action's inputs: switches as rows, everything else labelled above. */
const ActionInputs = ({
  step,
  action,
  subject,
  dataFields,
  disabled,
  onChange,
}: SettingsProps<'action'> & { action: ActionInfo; dataFields: FieldInfo[] }) => {
  const setInput = (key: string, value: unknown) =>
    onChange({ ...step, input: { ...step.input, [key]: value } });

  return (
    <div className="space-y-4 border-t pt-4">
      {action.fields.map((field) =>
        field.type === 'boolean' ? (
          <label
            key={field.key}
            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5"
          >
            <span className="min-w-0">
              <span className="block text-sm">{field.label}</span>
              {field.description && (
                <span className="block text-xs text-muted-foreground">{field.description}</span>
              )}
            </span>
            <Switch
              checked={step.input[field.key] === true}
              disabled={disabled}
              onCheckedChange={(checked) => setInput(field.key, checked)}
            />
          </label>
        ) : (
          <div key={field.key} className="space-y-1.5">
            <FieldLabel>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </FieldLabel>
            <ActionFieldInput
              field={field}
              subject={subject}
              value={step.input[field.key]}
              input={step.input}
              dataFields={dataFields}
              disabled={disabled}
              onChange={(value) => setInput(field.key, value)}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        ),
      )}
    </div>
  );
};

const ActionSettings = ({
  actions,
  outputs,
  ...props
}: SettingsProps<'action'> & { actions: ActionInfo[]; outputs: FieldInfo[] }) => {
  const { t } = useTranslation('automations');
  const { step, subject, disabled, onChange } = props;
  const action = actions.find((item) => item.type === step.action);
  const { fields: recordFields } = useAutomationFields(subject);

  return (
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
            onChange({
              ...step,
              action: type,
              input: actionDefaults(actions.find((item) => item.type === type)),
            })
          }
        />
        {action?.description && (
          <p className="text-xs text-muted-foreground">{action.description}</p>
        )}
      </div>
      {action && action.fields.length > 0 && (
        <ActionInputs {...props} action={action} dataFields={[...recordFields, ...outputs]} />
      )}
      <div className="border-t pt-4">
        <NameField step={step} disabled={disabled} onChange={onChange} />
      </div>
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

  switch (step.type) {
    case 'action':
      return <ActionSettings {...props} step={step} actions={actions} outputs={outputs} />;
    case 'delay':
      return <DelaySettings {...props} step={step} />;
    case 'wait_for':
      return <WaitForSettings {...props} step={step} />;
    case 'branch':
      return (
        <div className="space-y-1.5">
          <FieldLabel>{t('branch-if', 'Take the Yes path when')}</FieldLabel>
          <ConditionsEditor
            subject={subject}
            extraFields={outputs}
            value={step.conditions}
            disabled={disabled}
            onChange={(conditions) =>
              onChange({ ...step, conditions: conditions ?? { match: 'all', rules: [] } })
            }
          />
        </div>
      );
    case 'switch':
      return <SwitchCases {...props} step={step} outputs={outputs} />;
    case 'split':
      return <SplitPaths step={step} disabled={disabled} onChange={onChange} />;
    case 'stop':
      return (
        <p className="text-sm text-muted-foreground">
          {t('stop-hint', 'The run ends here, even if steps follow.')}
        </p>
      );
    default:
      return null;
  }
};

/**
 * One step's own settings (the inspector): the action and its inputs, a
 * wait, a branch's conditions, a switch's cases, a split's paths. The steps
 * inside arms are edited on the canvas.
 */
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
