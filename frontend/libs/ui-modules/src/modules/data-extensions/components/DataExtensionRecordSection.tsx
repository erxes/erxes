import { IconVariable } from '@tabler/icons-react';
import { Button, Skeleton, Spinner, toast } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataExtensionFields } from '../hooks/useDataExtensionFields';
import {
  useDataExtensionRecord,
  useDataExtensionValuesWriter,
} from '../hooks/useDataExtensionRecord';
import { useDataExtensionRecordTypes } from '../hooks/useDataExtensionRecordTypes';
import { DataExtensionValue } from '../types';
import { DataExtensionFieldsEditor } from './DataExtensionFieldsEditor';

const sameValue = (a: DataExtensionValue, b: DataExtensionValue) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const isEmpty = (value: DataExtensionValue) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && !value.length);

/** Active definitions of one record type, if its owner is enabled. */
const useRecordTypeFields = (recordType: string) => {
  const { fields } = useDataExtensionFields({ recordType });
  const { recordTypes } = useDataExtensionRecordTypes();
  const descriptor = recordTypes.find(
    (candidate) => candidate.recordType === recordType,
  );

  return { fields: descriptor ? fields : [], descriptor, recordTypes };
};

const SectionTitle = ({ busy }: { busy?: boolean }) => {
  const { t } = useTranslation('dataExtensions');

  return (
    <h3 className="flex items-center gap-2 text-sm font-medium">
      <IconVariable className="size-4 text-muted-foreground" />
      {t('section.title')}
      {busy && <Spinner size="sm" />}
    </h3>
  );
};

/**
 * Extension fields of one record on its module's detail page. Edits are
 * kept as a draft and saved together, through the tenant endpoint, so the
 * owner validates them against the current definitions. Renders nothing
 * when the record type has no fields.
 */
export const DataExtensionRecordSection = ({
  recordType,
  recordId,
}: {
  /** Registry name, e.g. `operation:project`. */
  recordType: string;
  recordId: string;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { fields, descriptor, recordTypes } = useRecordTypeFields(recordType);
  const { record, loading, saving, error, load, save } = useDataExtensionRecord(
    descriptor,
    fields,
    recordTypes,
  );
  const [draft, setDraft] = useState<Record<string, DataExtensionValue>>({});

  useEffect(() => {
    if (descriptor && fields.length && recordId) {
      load(recordId);
    }
  }, [descriptor, fields, recordId, load]);

  useEffect(() => {
    setDraft(record?.values || {});
  }, [record]);

  const changes = useMemo(() => {
    const patch: Record<string, DataExtensionValue> = {};

    for (const field of fields) {
      if (field.relation && !record?.editableLinks.includes(field.key)) {
        continue;
      }

      const next = draft[field.key] ?? null;

      if (!sameValue(next, record?.values[field.key] ?? null)) {
        patch[field.key] = next;
      }
    }

    return patch;
  }, [draft, fields, record]);

  const changeCount = Object.keys(changes).length;

  const onSave = async () => {
    try {
      await save(changes);
      toast({ variant: 'success', title: t('toast.values-saved') });
    } catch (saveError) {
      toast({
        variant: 'destructive',
        title: t('toast.values-failed'),
        description: saveError instanceof Error ? saveError.message : undefined,
      });
    }
  };

  if (!fields.length) {
    return null;
  }

  return (
    <section
      className="flex flex-col gap-4 rounded-lg border p-4"
      aria-label={t('section.title')}
    >
      <SectionTitle busy={loading && Boolean(record)} />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      ) : !record ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-hidden>
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      ) : (
        <DataExtensionFieldsEditor
          fields={fields}
          values={draft}
          links={record.links}
          editableLinks={record.editableLinks}
          disabled={saving}
          idPrefix={`data-extensions-${recordId}`}
          onChange={(key, value) =>
            setDraft((current) => ({ ...current, [key]: value }))
          }
        />
      )}
      {record && changeCount > 0 && (
        <footer className="flex items-center justify-end gap-2 border-t pt-3">
          <span className="mr-auto text-xs text-muted-foreground">
            {t('values.unsaved', { count: changeCount })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={() => setDraft(record.values)}
          >
            {t('values.discard')}
          </Button>
          <Button size="sm" disabled={saving} onClick={onSave}>
            {saving && <Spinner size="sm" />}
            {t('values.save')}
          </Button>
        </footer>
      )}
    </section>
  );
};

/**
 * Extension values typed into a create form before the record exists.
 * Call `saveTo` with the new record's id once the module has created it.
 */
export const useDataExtensionDraft = (recordType: string) => {
  const { fields, descriptor, recordTypes } = useRecordTypeFields(recordType);
  const write = useDataExtensionValuesWriter(descriptor, fields, recordTypes);
  const [values, setValues] = useState<Record<string, DataExtensionValue>>({});

  const onChange = useCallback(
    (key: string, value: DataExtensionValue) =>
      setValues((current) => ({ ...current, [key]: value })),
    [],
  );

  const reset = useCallback(() => setValues({}), []);

  const saveTo = useCallback(
    (_id: string) =>
      write(
        _id,
        Object.fromEntries(
          Object.entries(values).filter(([, value]) => !isEmpty(value)),
        ),
      ),
    [write, values],
  );

  return { fields, values, onChange, reset, saveTo };
};

export type DataExtensionDraft = ReturnType<typeof useDataExtensionDraft>;

/** The fields of a `useDataExtensionDraft`, for a create form. */
export const DataExtensionDraftFields = ({
  draft,
  idPrefix = 'data-extensions-new',
}: {
  draft: DataExtensionDraft;
  idPrefix?: string;
}) => {
  if (!draft.fields.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle />
      <DataExtensionFieldsEditor
        fields={draft.fields}
        values={draft.values}
        idPrefix={idPrefix}
        onChange={draft.onChange}
      />
    </section>
  );
};
