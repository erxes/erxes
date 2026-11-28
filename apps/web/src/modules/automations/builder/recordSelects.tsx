import type { ActionInfo } from '@erxes/core-contract';
import { skipToken, useQuery } from '@tanstack/react-query';
import { LookupPicker, pluginJson, textOf } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { catalogQuery } from '../automationQueries';
import { type ActionInputProps, asList } from './actionFieldSelects';
import { AppRecordPicker, parentsOf } from './AppRecordPicker';
import type { FieldInfo } from './useAutomationFields';

const PluginRecords = z.array(z.object({ value: z.string(), label: z.string() }));

/** The core app an action belongs to (`facebook`), which lists its records; null for a plugin's. */
export const appOf = (action: ActionInfo) => (action.source === 'core' ? action.integration : null);

/**
 * The run's values that are records of this type (the trigger's task, a deal an earlier step
 * created), as picker options that insert them: "Task created: Task". A plugin's records match
 * by the plugin, an app's by the app.
 */
const runRecordOptions = (
  dataFields: FieldInfo[],
  owner: { source: string } | { integration: string },
  recordType: string | undefined,
) =>
  dataFields
    .filter(
      (item) =>
        recordType &&
        item.recordType === recordType &&
        ('integration' in owner
          ? item.integration === owner.integration
          : item.source === owner.source),
    )
    .map((item) => ({
      value: `{{${item.path}}}`,
      label: item.groupLabel ? `${item.groupLabel}: ${item.label}` : item.label,
    }));

/**
 * An app's records, listed by core with the step's connection, after the run's values of that
 * type: a run's post fits whichever page is chosen, as the trigger listens to that page.
 */
const AppRecordSelect = ({
  app,
  action,
  field,
  value,
  onChange,
  disabled,
  input,
  dataFields,
}: ActionInputProps & { app: string }) => {
  const { t } = useTranslation('automations');
  const catalog = useQuery(catalogQuery());
  const parents = parentsOf(field.dependsOn, action.fields, (key) => textOf(input[key]));
  const recordType = field.recordType ?? '';

  return (
    <AppRecordPicker
      integration={app}
      recordType={recordType}
      listable={Boolean(
        catalog.data?.apps.find((item) => item.key === app)?.records.includes(recordType),
      )}
      connection={textOf(input.connection) || undefined}
      parents={parents}
      runOptions={runRecordOptions(dataFields, { integration: app }, field.recordType)}
      value={asList(value)}
      onValueChange={(ids) => onChange(field.multiple ? ids : ids[0])}
      multiple={field.multiple}
      noneLabel={field.required ? undefined : t('none', 'None')}
      disabled={disabled}
      waitingFor={
        parents.includes('')
          ? (action.fields.find((other) => other.key === field.dependsOn)?.label ?? '')
          : undefined
      }
    />
  );
};

/** The plugin's own records, listed by its API with the member's session. */
const OwnRecordSelect = ({
  action,
  field,
  value,
  onChange,
  disabled = false,
  input,
  dataFields,
}: ActionInputProps) => {
  const { t } = useTranslation('automations');
  const { recordType, dependsOn, multiple } = field;
  const parent = dependsOn === undefined ? '' : textOf(input[dependsOn]);
  const waiting = dependsOn !== undefined && !parent;
  // A parent taken from the run is known only when it runs: then only the run's records fit.
  // A chosen parent lists its own records: a run's record may sit under another one.
  const fromRun = parent.startsWith('{{');
  const listed = Boolean(recordType) && !waiting && !fromRun;
  const query = new URLSearchParams(parent ? { parent } : {});

  const records = useQuery({
    queryKey: ['plugin-records', action.source, recordType, parent],
    queryFn:
      recordType && listed
        ? () =>
            pluginJson(action.source, `/automations/records/${recordType}?${query}`, PluginRecords)
        : skipToken,
  });

  const parentLabel = action.fields.find((other) => other.key === dependsOn)?.label;

  return (
    <LookupPicker
      multiple={multiple}
      lookup={{
        options: [
          ...(fromRun || dependsOn === undefined
            ? runRecordOptions(dataFields, { source: action.source }, recordType)
            : []),
          ...(listed ? (records.data ?? []) : []),
        ],
        loading: listed && records.isPending,
        error: records.error,
      }}
      value={asList(value)}
      onValueChange={(ids) => onChange(multiple ? ids : ids[0])}
      disabled={disabled || waiting}
      placeholder={
        waiting
          ? t('choose-parent-first', 'Choose {{field}} first', { field: parentLabel })
          : t('choose', 'Choose…')
      }
    />
  );
};

/**
 * A `plugin_record` input: the plugin's own records, or a core app's, after the run's records
 * of that type. With `dependsOn`, the records under that input's value, once it has one; with
 * `multiple`, several.
 */
export const PluginRecordSelect = (props: ActionInputProps) => {
  const app = appOf(props.action);

  return app ? <AppRecordSelect {...props} app={app} /> : <OwnRecordSelect {...props} />;
};
