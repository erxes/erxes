import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import { IconChevronUp, IconPlus } from '@tabler/icons-react';
import { Button, Input, Switch } from 'erxes-ui';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionFieldInput } from './ActionFieldInput';
import { SplitPaths, SwitchCases } from './ArmSettings';
import { BuilderContext } from './BuilderContext';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { FieldLabel } from './FieldLabel';
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

const useDetails = (step: Extract<AutomationStep, { type: 'action' }>, action: ActionInfo) => {
  const filledKeys = () =>
    new Set(action.fields.filter((field) => !isEmpty(step.input[field.key])).map(({ key }) => key));

  const [showAll, setShowAll] = useState(false);
  const [kept, setKept] = useState(filledKeys);
  const shown = action.fields.filter((field) => showAll || field.required || kept.has(field.key));
  const labelShown = showAll || Boolean(step.label);
  const hiddenCount = action.fields.length - shown.length + Number(!labelShown);

  const emptyOptional = action.fields.some(
    (field) => !field.required && isEmpty(step.input[field.key]),
  );

  return {
    shown,
    showAll,
    labelShown,
    hiddenCount,
    foldable: showAll ? emptyOptional || !step.label : hiddenCount > 0,
    toggle: () => {
      setKept(filledKeys());
      setShowAll(!showAll);
    },
  };
};

const DetailsToggle = ({ details }: { details: ReturnType<typeof useDetails> }) => {
  const { t } = useTranslation('automations');

  return (
    <Button variant="ghost" size="sm" tone="muted" className="-ml-2" onClick={details.toggle}>
      {details.showAll ? <IconChevronUp /> : <IconPlus />}
      {details.showAll
        ? t('fewer-details', 'Show fewer details')
        : t('more-details', 'Add more details ({{count}})', { count: details.hiddenCount })}
    </Button>
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
  const { t } = useTranslation('automations');

  // The inputs that follow `key` (a status follows its pipeline), and the ones that follow those.
  const dependents = (key: string): string[] =>
    action.fields
      .filter((field) => field.dependsOn === key)
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
  const details = useDetails(step, action);

  return (
    <div className="space-y-4 border-t pt-4">
      {details.shown.map((field) =>
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
              {field.required && <span className="text-destructive-text"> *</span>}
            </FieldLabel>
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
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            {empty.has(field.key) && (
              <p className="text-xs text-destructive-text">
                {t('fill-in-field', 'Fill in {{field}}', { field: field.label.toLowerCase() })}
              </p>
            )}
          </div>
        ),
      )}
      {details.labelShown && <NameField step={step} disabled={disabled} onChange={onChange} />}
      {details.foldable && <DetailsToggle details={details} />}
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
  const { hasSubject } = useContext(BuilderContext);
  const { fields } = useAutomationFields(subject);
  const recordFields = hasSubject ? fields : [];

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
        <div className="space-y-1.5">
          <FieldLabel>{t('branch-if', 'Take the Yes path when')}</FieldLabel>
          <ConditionsEditor
            subject={hasSubject ? subject : null}
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
