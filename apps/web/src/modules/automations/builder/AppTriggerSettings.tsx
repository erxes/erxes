import { type AutomationApp, type AutomationTrigger, appEventType } from '@erxes/core-contract';
import { ConnectionPicker, Input, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { Catalog } from '../automationQueries';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { eventDataFields } from './flowChecks';
import { Field } from './triggerFields';
import { HookSubjectEditor } from './WebhookTriggerSettings';

type AppTrigger = Extract<AutomationTrigger, { kind: 'app' }>;

type Param = AutomationApp['triggers'][number]['params'][number];

export const startingEventType = (trigger: AutomationTrigger) => {
  if (trigger.kind === 'event') return trigger.event;

  return trigger.kind === 'app' && trigger.trigger
    ? appEventType(trigger.app, trigger.trigger)
    : null;
};

const ParamInput = ({
  field,
  value,
  disabled,
  onChange,
}: {
  field: Param;
  value: unknown;
  disabled?: boolean;
  onChange: (value: string | boolean | null) => void;
}) =>
  field.type === 'switch' ? (
    <Switch
      checked={value === true}
      disabled={disabled}
      aria-label={field.label}
      onCheckedChange={onChange}
    />
  ) : (
    <Input
      value={typeof value === 'string' ? value : ''}
      disabled={disabled}
      aria-label={field.label}
      onChange={(event) => onChange(event.target.value || null)}
    />
  );

const pickTrigger = (trigger: AppTrigger, apps: AutomationApp[], type: string): AppTrigger => {
  const app = apps.find((item) => item.triggers.some((each) => each.type === type));
  const next = app?.triggers.find((each) => each.type === type);

  if (!app || !next) return trigger;

  if (app.key === trigger.app) return { ...trigger, trigger: next.key };

  return {
    kind: 'app',
    app: app.key,
    trigger: next.key,
    connectionId: app.connections.find((item) => item.status === 'active')?.id ?? '',
    params: {},
  };
};

const AppSource = ({
  trigger,
  app,
  onChange,
  disabled,
}: {
  trigger: AppTrigger;
  app: AutomationApp;
  onChange: (trigger: AppTrigger) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const params = app.triggers.find((item) => item.key === trigger.trigger)?.params ?? [];

  return (
    <>
      <Field
        label={t('app-connection', 'Connection')}
        hint={t('app-connection-hint', 'The account whose events start runs.')}
      >
        <ConnectionPicker
          integration={app.key}
          value={trigger.connectionId || null}
          onValueChange={(connectionId) =>
            onChange({ ...trigger, connectionId: connectionId ?? '' })
          }
        />
      </Field>
      {params.map((field) => (
        <Field key={field.key} label={field.label}>
          <ParamInput
            field={field}
            value={trigger.params[field.key]}
            disabled={disabled}
            onChange={(value) =>
              onChange({ ...trigger, params: { ...trigger.params, [field.key]: value } })
            }
          />
        </Field>
      ))}
    </>
  );
};

export const AppTriggerSettings = ({
  trigger,
  catalog,
  onChange,
  disabled,
}: {
  trigger: AppTrigger;
  catalog: Pick<Catalog, 'apps' | 'triggers'>;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const app = catalog.apps.find((item) => item.key === trigger.app);
  const type = startingEventType(trigger);
  const started = catalog.triggers.find((item) => item.type === type);
  const fields = eventDataFields(started);
  const items = catalog.triggers.filter((item) => item.type.startsWith('app.'));

  return (
    <>
      <Field label={t('app-trigger', 'App event')}>
        <CatalogPicker
          kind="event"
          items={items}
          value={type ?? ''}
          disabled={disabled}
          onChange={(next) => onChange(pickTrigger(trigger, catalog.apps, next))}
        />
      </Field>
      {app && <AppSource trigger={trigger} app={app} disabled={disabled} onChange={onChange} />}
      {started && (
        <>
          <HookSubjectEditor
            trigger={trigger}
            fields={fields}
            sample={null}
            disabled={disabled}
            onChange={onChange}
          />
          <Field
            label={t('only-if', 'Only if')}
            hint={
              trigger.conditions?.rules.length
                ? undefined
                : t('app-only-if-empty', 'No conditions: every such event starts a run.')
            }
          >
            <ConditionsEditor
              subject={trigger.subject?.type ?? null}
              extraFields={fields}
              value={trigger.conditions}
              disabled={disabled}
              onChange={(conditions) => onChange({ ...trigger, conditions })}
            />
          </Field>
        </>
      )}
    </>
  );
};
