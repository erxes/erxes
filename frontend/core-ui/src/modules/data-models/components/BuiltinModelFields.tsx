import { zodResolver } from '@hookform/resolvers/zod';
import { useApolloClient, useMutation } from '@apollo/client';
import { IconDatabase } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Button,
  Form,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  toast,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Can, PanelField } from 'ui-modules';
import {
  builtinFieldValue,
  builtinModelUpdateDocument,
  type BuiltinModelName,
  type BuiltinModelRecord,
} from '../builtinDocuments';
import {
  createRecordValuesSchema,
  buildRecordPatch,
  formatModelFieldValue,
} from '../recordUtils';
import { recordInputByName, relationValueIds } from '../recordDocuments';
import { useBuiltinModelFields } from '../useBuiltinModelFields';
import type { ModelField } from '../types';
import { DataModelRecordFields } from './DataModelRecordFields';
import { uniqueModelFields } from '../relationGroups';
import { DataModelError, DataModelLoading } from './DataModelFeedback';
import { DataModelRelationValue } from './DataModelRelationValue';
import { dataModelErrorMessage } from '../errorMessage';
import { DataModelReverseRelationValue } from './DataModelReverseRelationValue';
import { useDataModelEditorClose } from '../useDataModelEditorClose';

const businessWriteActions: Record<BuiltinModelName, string> = {
  customer: 'contactsUpdate',
  company: 'contactsUpdate',
  product: 'productsUpdate',
  user: 'teamMembersUpdate',
};
const businessQueryNames: Record<BuiltinModelName, string[]> = {
  customer: ['customersRecordTable', 'contactsCustomerDetailWithModelFields'],
  company: [],
  product: [],
  user: [],
};

const BuiltinModelFieldEditor = ({
  model,
  record,
  fields,
  onClose,
}: {
  model: BuiltinModelName;
  record: BuiltinModelRecord;
  fields: ModelField[];
  onClose: () => void;
}) => {
  const client = useApolloClient();
  const previous = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [
          field._id,
          relationValueIds(field, builtinFieldValue(record, field.name)),
        ]),
      ),
    [fields, record],
  );
  const schema = useMemo(
    () =>
      createRecordValuesSchema(
        fields,
        fields.filter((field) => !field.relation?.isInverse),
        previous,
        () => null,
      ),
    [fields, previous],
  );
  const form = useForm<{ values: Record<string, unknown> }>({
    resolver: zodResolver(schema),
    defaultValues: { values: previous },
  });
  const { dirtyFields } = form.formState;
  const document = useMemo(
    () => builtinModelUpdateDocument(model, fields),
    [model, fields],
  );
  const [save, { loading, error }] = useMutation(document, {
    onError: (failure) =>
      toast({
        title: 'Unable to save model fields',
        description: dataModelErrorMessage(failure),
        variant: 'destructive',
      }),
  });
  const close = useDataModelEditorClose({
    dirty: form.formState.isDirty,
    loading,
    onClose,
  });
  const expectedVersion = builtinFieldValue(record, '_dataModelVersion');
  const submit = form.handleSubmit(async ({ values }) => {
    const patch = buildRecordPatch(
      fields,
      values,
      new Set(Object.keys(dirtyFields.values ?? {})),
    );
    if (!Object.keys(patch).length) {
      onClose();
      return;
    }
    if (typeof expectedVersion !== 'number') return;
    try {
      const result = await save({
        variables: {
          _id: record._id,
          expectedVersion,
          input: recordInputByName(patch, fields),
        },
      });
      if (!result.data) return;
      await client.refetchQueries({
        onQueryUpdated: (query) => query.refetch().catch(() => false),
        include: [
          ...businessQueryNames[model],
          'dataModelsUiRecords',
          'dataModelsUiRecordDetail',
          'dataModelsUiReverseLinks',
          'dataModelsUiRelationOptions',
          'dataModelsUiRelationReferences',
        ],
      });
      toast({ title: 'Model fields updated', variant: 'success' });
      onClose();
    } catch {
      /* Keep the opening snapshot and entered values visible on conflicts. */
    }
  });
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) void close();
      }}
    >
      <Sheet.View className="p-0">
        <Form {...form}>
          <form className="flex h-full flex-col" onSubmit={submit}>
            <Sheet.Header>
              <Sheet.Title>Edit model fields</Sheet.Title>
              <Sheet.Description>
                Additional fields on this {model}.
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="space-y-5 overflow-y-auto px-5 py-5">
              <DataModelRecordFields
                fields={fields.filter((field) => !field.relation?.isInverse)}
                form={form}
                loading={loading}
                idPrefix="builtin-field"
              />
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {dataModelErrorMessage(error)}
                </p>
              )}
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                variant="outline"
                type="button"
                disabled={loading}
                onClick={() => {
                  void close();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || typeof expectedVersion !== 'number'}
              >
                {loading ? 'Saving…' : 'Save model fields'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};

export const BuiltinModelFieldValue = ({
  model,
  field,
  fields,
  record,
}: {
  model: BuiltinModelName;
  field: ModelField;
  fields: ModelField[];
  record: BuiltinModelRecord;
}) => {
  const [snapshot, setSnapshot] = useState<BuiltinModelRecord | null>(null);
  const value = formatModelFieldValue(field, fields, (member) =>
    builtinFieldValue(record, member.name),
  );
  return (
    <>
      {field.relation?.isInverse ? (
        <DataModelReverseRelationValue
          model={{ name: model, source: 'BUILTIN' }}
          field={field}
          recordId={record._id}
        />
      ) : (
        field.relation && (
          <DataModelRelationValue
            field={field}
            fields={fields}
            read={(member) => builtinFieldValue(record, member.name)}
          />
        )
      )}
      {(!field.relation || !field.relation.isInverse) && (
        <Can
          action="dataModelRecordsUpdate"
          fallback={
            !field.relation && <span className="truncate text-sm">{value}</span>
          }
        >
          <Can
            action={businessWriteActions[model]}
            fallback={
              !field.relation && (
                <span className="truncate text-sm">{value}</span>
              )
            }
          >
            <Button
              variant="ghost"
              className="h-full w-full justify-start truncate rounded-sm px-2 font-normal"
              disabled={
                typeof builtinFieldValue(record, '_dataModelVersion') !==
                  'number' || Boolean(field.relation?.isInverse)
              }
              aria-label={`Edit ${field.label}`}
              onClick={() => setSnapshot(record)}
            >
              {field.relation ? 'Edit links' : value}
            </Button>
          </Can>
        </Can>
      )}
      {snapshot && (
        <BuiltinModelFieldEditor
          model={model}
          record={snapshot}
          fields={fields}
          onClose={() => setSnapshot(null)}
        />
      )}
    </>
  );
};

export const builtinModelColumns = <TRecord extends BuiltinModelRecord>(
  model: BuiltinModelName,
  fields: ModelField[],
): ColumnDef<TRecord>[] =>
  uniqueModelFields(fields).map((field) => ({
    id: `dataModel_${field._id}`,
    accessorFn: (record) => builtinFieldValue(record, field.name),
    size: 200,
    header: () => (
      <RecordTable.InlineHead label={field.label} icon={IconDatabase} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <BuiltinModelFieldValue
          model={model}
          field={field}
          fields={fields}
          record={row.original}
        />
      </RecordTableInlineCell>
    ),
  }));

export const BuiltinModelFields = ({
  model,
  record,
}: {
  model: BuiltinModelName;
  record: BuiltinModelRecord;
}) => {
  const { fields, loading, error, retry } = useBuiltinModelFields(model);
  if (loading) return <DataModelLoading />;
  if (error) return <DataModelError error={error} onRetry={retry} />;
  if (!fields.length) return null;
  return (
    <section className="mt-3 border-t pt-3" aria-label="Data model fields">
      {uniqueModelFields(fields).map((field) => (
        <PanelField key={field._id} label={field.label}>
          <BuiltinModelFieldValue
            model={model}
            field={field}
            fields={fields}
            record={record}
          />
        </PanelField>
      ))}
    </section>
  );
};
