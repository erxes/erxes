import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Sheet } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createRecordDocuments, recordInputByName } from '../recordDocuments';
import { useDataModelMutation } from '../hooks';
import {
  buildRecordPatch,
  createRecordValuesSchema,
  getWritableFields,
  isModelFieldRequired,
  isEmptyRecordValue,
} from '../recordUtils';
import type { DataModel, DataModelRecord, ModelField } from '../types';
import { dataModelErrorMessage } from '../errorMessage';
import { useDataModelEditorClose } from '../useDataModelEditorClose';
import { DataModelRecordFields } from './DataModelRecordFields';

export const DataModelRecordForm = ({
  model: initialModel,
  record: initialRecord,
  fields: initialFields,
  onClose,
}: {
  model: DataModel;
  record?: DataModelRecord;
  fields: ModelField[];
  onClose: () => void;
}) => {
  const [{ model, record, fields }] = useState({
    model: initialModel,
    record: initialRecord,
    fields: initialFields,
  });
  const restoring = Boolean(record?.deletedAt);
  const writable = useMemo(
    () => getWritableFields(model, fields),
    [model, fields],
  );
  const schema = useMemo(
    () =>
      createRecordValuesSchema(fields, writable, record?.values, () => null),
    [fields, writable, record],
  );
  const form = useForm<{ values: Record<string, unknown> }>({
    resolver: zodResolver(schema),
    defaultValues: { values: record?.values ?? {} },
  });
  const { dirtyFields } = form.formState;
  const documents = useMemo(
    () => createRecordDocuments(model, fields),
    [model, fields],
  );
  const [save, { loading, error }] = useDataModelMutation(
    restoring
      ? documents.restore
      : record
      ? documents.update
      : documents.create,
    restoring
      ? 'Record restored'
      : record
      ? 'Record updated'
      : 'Record created',
  );
  const close = useDataModelEditorClose({
    dirty: form.formState.isDirty,
    loading,
    onClose,
  });
  const blockedRequired = fields.filter(
    (field) =>
      isModelFieldRequired(field) &&
      !writable.some((entry) => entry._id === field._id) &&
      isEmptyRecordValue(record?.values[field._id]),
  );
  const submit = form.handleSubmit(async ({ values }) => {
    const changed = record
      ? new Set(Object.keys(dirtyFields.values ?? {}))
      : undefined;
    const patch = buildRecordPatch(writable, values, changed);
    if (record && !restoring && !Object.keys(patch).length) {
      onClose();
      return;
    }
    try {
      const result = await save({
        variables: {
          input: {
            ...recordInputByName(patch, fields),
            _modelVersion: model.version,
          },
          ...(record
            ? { _id: record._id, expectedVersion: record.version }
            : {}),
        },
      });
      if (!result.data) return;
      onClose();
    } catch {
      /* Keep unsaved values and the expected version after a failure. */
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
              <Sheet.Title>
                {restoring ? 'Restore' : record ? 'Edit' : 'New'}{' '}
                {model.labelSingular}
              </Sheet.Title>
              <Sheet.Description className="sr-only">
                Enter values for the custom model fields.
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="space-y-5 overflow-y-auto px-5 py-4">
              {record && (
                <div className="space-y-1 border-b pb-4 text-xs text-muted-foreground">
                  <p className="break-all font-mono">{record._id}</p>
                  <p>
                    Version {record.version} · Created{' '}
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              {restoring && (
                <p className="text-sm text-muted-foreground">
                  You can fill newly required fields before restoring this
                  record.
                </p>
              )}
              {!writable.length && (
                <p className="text-sm text-muted-foreground">
                  No fields yet. Add fields in this model’s Fields tab.
                </p>
              )}
              {blockedRequired.length > 0 && (
                <p role="alert" className="text-sm text-destructive">
                  Required fields cannot be filled by this editor:{' '}
                  {blockedRequired.map((field) => field.label).join(', ')}.
                  Update their field configuration first.
                </p>
              )}
              <DataModelRecordFields
                fields={writable}
                form={form}
                loading={loading}
                idPrefix="record-field"
              />
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {dataModelErrorMessage(error)} Your entries are kept in this
                  form.
                </p>
              )}
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => {
                  void close();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || blockedRequired.length > 0}
              >
                {loading
                  ? 'Saving…'
                  : restoring
                  ? 'Restore record'
                  : record
                  ? 'Save changes'
                  : 'Create record'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
