import type { AppliesTo, DataExtensionField, DataExtensionValues } from '@erxes/core-contract';
import { type UseQueryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollArea, type TDataValue } from 'erxes-ui';
import type { ReactNode } from 'react';
import { QueryState } from '~/components/QueryState';
import { useFields } from '~/modules/dataExtensions/dataQueries';
import { RecordFields } from '~/modules/dataExtensions/values/RecordFields';
import type { PluginDataFieldsType } from './pluginDataFields';

/** What the record is in, read before its groups show. */
const WithAppliesTo = ({
  options,
  children,
}: {
  options: UseQueryOptions<AppliesTo>;
  children: (appliesTo: AppliesTo) => ReactNode;
}) => {
  const query = useQuery(options);

  return <QueryState query={query}>{children}</QueryState>;
};

/** A plugin's values by field id as the form's, by key: every field, null where none is kept. */
const byKey = (
  fields: DataExtensionField[],
  values: Record<string, TDataValue>,
): DataExtensionValues =>
  Object.fromEntries(fields.map((field) => [field.key, values[field.id] ?? null]));

/** The form's changes by key as the plugin's patch, by field id. */
const byId = (fields: DataExtensionField[], changes: DataExtensionValues) =>
  Object.fromEntries(
    fields.flatMap((field) =>
      Object.hasOwn(changes, field.key) ? [[field.id, changes[field.key] ?? null]] : [],
    ),
  );

/**
 * A plugin record's Data Extensions fields, as its Fields tab: core's editors on the values the
 * plugin keeps in its records' `custom_fields`. A change goes to the plugin's `save` (which
 * checks it with `dataValues.check`), then its values are read again. A type with `limits`
 * shows only the groups that apply to the record.
 */
export const PluginRecordFields = ({
  type,
  contentId,
}: {
  type: PluginDataFieldsType;
  contentId: string;
}) => {
  const client = useQueryClient();
  const { values, save, appliesTo } = type.dataFields;
  const query = useQuery(values(contentId));
  const { fields } = useFields(type.type);

  const fieldsOf = (data: Record<string, TDataValue>, record?: AppliesTo) => (
    <RecordFields
      recordType={type.type}
      values={byKey(fields, data)}
      appliesTo={record}
      save={async (changes) => {
        await save(contentId, byId(fields, changes));
        await client.invalidateQueries({ queryKey: values(contentId).queryKey });
      }}
    />
  );

  return (
    <ScrollArea className="flex-1 min-h-0" fitWidth>
      <div className="p-3">
        <QueryState query={query}>
          {(data) =>
            appliesTo ? (
              <WithAppliesTo options={appliesTo(contentId)}>
                {(record) => fieldsOf(data, record)}
              </WithAppliesTo>
            ) : (
              fieldsOf(data)
            )
          }
        </QueryState>
      </div>
    </ScrollArea>
  );
};
