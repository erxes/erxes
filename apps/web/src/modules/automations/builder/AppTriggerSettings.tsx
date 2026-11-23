import {
  type AutomationApp,
  type AutomationTrigger,
  appEventType,
  isAppEvent,
} from '@erxes/core-contract';
import { ConnectionPicker, Input, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { Catalog } from '../automationQueries';
import { AppRecordPicker, parentsOf } from './AppRecordPicker';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { Field } from './Field';
import { eventDataFields } from './flowChecks';
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
  app,
  trigger,
  params,
  field,
  value,
  disabled,
  onChange,
}: {
  app: AutomationApp;
  trigger: AppTrigger;
  params: Param[];
  field: Param;
  value: unknown;
  disabled?: boolean;
  onChange: (value: string | boolean | null) => void;
}) => {
  const { t } = useTranslation('automations');

  if (field.recordType) {
    const parents = parentsOf(field.dependsOn, params, (key) => {
      const given = trigger.params[key];

      return typeof given === 'string' ? given : '';
    });

    return (
      <AppRecordPicker
        integration={app.key}
        recordType={field.recordType}
        listable={app.records.includes(field.recordType)}
        connection={trigger.connectionId || undefined}
        parents={parents}
        value={typeof value === 'string' && value ? [value] : []}
        onValueChange={([picked]) => onChange(picked ?? null)}
        noneLabel={field.optional ? t('none', 'None') : undefined}
        disabled={disabled}
        waitingFor={
          parents.includes('')
            ? (params.find((other) => other.key === field.dependsOn)?.label ?? '')
            : undefined
        }
      />
    );
  }

  return field.type === 'switch' ? (
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
};

const CONNECTION = '__connection';

/** The settings that follow `key` (a sheet, its spreadsheet); every record follows the connection. */
const followersOf = (params: Param[], key: string): string[] =>
  params
    .filter((field) => (key === CONNECTION ? field.recordType : field.dependsOn === key))
    .flatMap((field) => [field.key, ...followersOf(params, field.key)]);

const cleared = (params: Param[], key: string) =>
  Object.fromEntries(followersOf(params, key).map((follower) => [follower, null]));

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
      <Field label={t('app-connection', 'Connection')}>
        <ConnectionPicker
          integration={app.key}
          value={trigger.connectionId || null}
          onValueChange={(connectionId) =>
            onChange({
              ...trigger,
              connectionId: connectionId ?? '',
              params: { ...trigger.params, ...cleared(params, CONNECTION) },
            })
          }
        />
      </Field>
      {params.map((field) => (
        <Field key={field.key} label={field.label}>
          <ParamInput
            app={app}
            trigger={trigger}
            params={params}
            field={field}
            value={trigger.params[field.key]}
            disabled={disabled}
            onChange={(value) =>
              onChange({
                ...trigger,
                params: { ...trigger.params, ...cleared(params, field.key), [field.key]: value },
              })
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

  const items = catalog.triggers.flatMap((item) => {
    const owner = catalog.apps.find((each) => each.triggers.some((one) => one.type === item.type));

    return isAppEvent(item.type) && owner
      ? [{ ...item, source: 'core', integration: owner.key, integrationName: owner.name }]
      : [];
  });

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
          <Field label={t('only-if', 'Only if')}>
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
