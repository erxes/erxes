import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { cn, Label, Skeleton, Spinner } from 'erxes-ui';
import { FocusEvent, KeyboardEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataExtensionFields } from '../hooks/useDataExtensionFields';
import { useDataExtensionRecord } from '../hooks/useDataExtensionRecord';
import { useDataExtensionRecordTypes } from '../hooks/useDataExtensionRecordTypes';
import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionLinkedRecord,
  IDataExtensionRecordType,
} from '../types';
import { DataExtensionRelationValue } from './DataExtensionRelationValue';
import { DataExtensionValueInput } from './DataExtensionValueInput';

/** Typed into, so saved when focus leaves the field or on Enter. */
const SAVE_ON_BLUR: IDataExtensionField['type'][] = [
  'text',
  'longText',
  'number',
  'email',
  'url',
  'phone',
];

const sameValue = (a: DataExtensionValue, b: DataExtensionValue) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * One field edited in place and saved on its own, the way Twenty persists
 * a field: typed values when focus leaves it, picked values right away.
 */
const DataExtensionInlineField = ({
  field,
  value,
  links,
  editable,
  readOnly,
  inputId,
  onSave,
}: {
  field: IDataExtensionField;
  value: DataExtensionValue;
  links: IDataExtensionLinkedRecord[];
  editable: boolean;
  readOnly: boolean;
  inputId: string;
  onSave: (key: string, value: DataExtensionValue) => Promise<void>;
}) => {
  const { t } = useTranslation('dataExtensions');
  const [draft, setDraft] = useState<DataExtensionValue>(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveOnBlur = !field.relation && SAVE_ON_BLUR.includes(field.type);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const save = async (next: DataExtensionValue) => {
    if (sameValue(next, value)) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await onSave(field.key, next);
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setSaving(false);
    }
  };

  const onChange = (next: DataExtensionValue) => {
    setDraft(next);
    setSaved(false);

    if (!saveOnBlur) {
      save(next);
    }
  };

  const onBlur = (event: FocusEvent<HTMLFieldSetElement>) => {
    if (
      saveOnBlur &&
      !event.currentTarget.contains(event.relatedTarget as Node | null)
    ) {
      save(draft);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLFieldSetElement>) => {
    if (saveOnBlur && event.key === 'Enter' && field.type !== 'longText') {
      event.preventDefault();
      save(draft);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={inputId}>{field.label}</Label>
        {saving && <Spinner size="sm" />}
        {!saving && saved && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconCheck className="size-3.5" />
            {t('inline.saved')}
          </span>
        )}
      </div>
      <fieldset
        disabled={readOnly || saving}
        className="min-w-0"
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      >
        {field.relation ? (
          <DataExtensionRelationValue
            id={inputId}
            field={field}
            value={draft}
            links={links}
            editable={editable && !readOnly}
            onChange={onChange}
          />
        ) : (
          <DataExtensionValueInput
            id={inputId}
            field={field}
            value={draft}
            onChange={onChange}
          />
        )}
      </fieldset>
      {error ? (
        <p
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <IconAlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )
      )}
    </div>
  );
};

/**
 * Fields of one record type on one record. Renders nothing when the record
 * is not of this type, e.g. lead fields on a customer: the owner applies
 * the record type's scope to the lookup.
 */
const RecordTypeFields = ({
  descriptor,
  recordTypes,
  recordId,
  showLabel,
  readOnly,
}: {
  descriptor: IDataExtensionRecordType;
  recordTypes: IDataExtensionRecordType[];
  recordId: string;
  showLabel: boolean;
  readOnly: boolean;
}) => {
  const { fields } = useDataExtensionFields({
    recordType: descriptor.recordType,
  });
  const { record, notFound, error, load, save } = useDataExtensionRecord(
    descriptor,
    fields,
    recordTypes,
  );

  useEffect(() => {
    if (fields.length && recordId) {
      load(recordId);
    }
  }, [fields, recordId, load]);

  if (notFound || !fields.length) {
    return null;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error.message}
      </p>
    );
  }

  if (!record) {
    return <Skeleton className="h-14" />;
  }

  const onSave = async (key: string, value: DataExtensionValue) => {
    await save({ [key]: value });
  };

  return (
    <section className="flex flex-col gap-4">
      {showLabel && (
        <h4 className="text-xs font-medium uppercase text-muted-foreground">
          {descriptor.label}
        </h4>
      )}
      {fields.map((field) => (
        <DataExtensionInlineField
          key={field._id}
          field={field}
          value={record.values[field.key] ?? null}
          links={record.links[field.key] || []}
          editable={record.editableLinks.includes(field.key)}
          readOnly={readOnly}
          inputId={`data-extensions-${recordId}-${field.key}`}
          onSave={onSave}
        />
      ))}
    </section>
  );
};

/**
 * Every Data Extension field that applies to a record, from the current
 * definitions: the record types registered for its content type, read and
 * saved through the tenant endpoint. Used by the generic detail widget, so
 * no module page lists its fields itself.
 */
export const DataExtensionRecordFields = ({
  contentType,
  recordId,
  readOnly = false,
  className,
}: {
  /** erxes content type of the record, e.g. `core:customer`. */
  contentType: string;
  recordId: string;
  readOnly?: boolean;
  className?: string;
}) => {
  const { recordTypes, loading } = useDataExtensionRecordTypes();
  const applicable = recordTypes.filter(
    (recordType) =>
      recordType.contentTypes.includes(contentType) && recordType.fieldCount,
  );

  if (loading && !recordTypes.length) {
    return <Spinner containerClassName="py-6" />;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {applicable.map((descriptor) => (
        <RecordTypeFields
          key={descriptor.recordType}
          descriptor={descriptor}
          recordTypes={recordTypes}
          recordId={recordId}
          showLabel={applicable.length > 1}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};
