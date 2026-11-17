import type { DataField, PluginManifest } from '@erxes/core-contract';

const ID_KEY = /[a-z]Ids?$/;

/** Core's records, which have no plugin record type: customers and companies are the subject. */
const CORE_ID_KEY = /^(customer|company|subject)Ids?$/;

const pluginIdKey = (key: string) => ID_KEY.test(key) && !CORE_ID_KEY.test(key);

/** A text value named like a plugin record's id that doesn't say which record type it holds. */
const untypedIds = (where: string, fields: DataField[]) =>
  fields
    .filter((field) => field.type === 'text' && pluginIdKey(field.key) && !field.recordType)
    .map(
      (field) =>
        `${where} field ${field.key} looks like a record id: give it a recordType so record pickers offer it`,
    );

const eventWarnings = (events: NonNullable<PluginManifest['events']>) =>
  events.flatMap((event) => {
    const fields = event.fields ?? [];

    if (!fields.length)
      return [
        `Event ${event.type} declares no fields: automations it starts can't use its data. Add fields and record`,
      ];

    return [
      ...(event.record
        ? []
        : [
            `Event ${event.type} names no record: the builder lists its fields as "${event.label}"`,
          ]),
      ...untypedIds(`Event ${event.type}`, fields),
    ];
  });

const actionWarnings = (actions: NonNullable<PluginManifest['actions']>) =>
  actions.flatMap((action) => [
    ...action.fields
      .filter(
        (field) => (field.type === 'text' || field.type === 'number') && ID_KEY.test(field.key),
      )
      .map(
        (field) =>
          `Action ${action.type} input ${field.key} takes a typed id: make it a picker (members for team members, else a plugin_record with a recordType; multiple for a list)`,
      ),
    ...untypedIds(`Action ${action.type} output`, action.outputs ?? []),
  ]);

/** What a manifest leaves out that members will miss in the automation builder, one line each. */
export const manifestWarnings = (manifest: PluginManifest) => [
  ...eventWarnings(manifest.events ?? []),
  ...actionWarnings(manifest.actions ?? []),
];
