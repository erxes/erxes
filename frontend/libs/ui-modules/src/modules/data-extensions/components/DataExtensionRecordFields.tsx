import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { cn, Skeleton, Spinner } from 'erxes-ui';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FocusEvent, KeyboardEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataExtensionFields } from '../hooks/useDataExtensionFields';
import { useDataExtensionRecord } from '../hooks/useDataExtensionRecord';
import { useDataExtensionRecordTypes } from '../hooks/useDataExtensionRecordTypes';
import { usePermissionCheck } from '../../permissions/hooks/usePermissionCheck';
import {
  DataExtensionValue,
  displayFieldOf,
  IDataExtensionField,
  IDataExtensionLinkedRecord,
  IDataExtensionRecordType,
  isComputedField,
  isFieldVisible,
} from '../types';
import { DataExtensionValueDisplay } from './DataExtensionValueDisplay';
import { DataExtensionFieldLabel } from './DataExtensionFieldLabel';
import { DataExtensionRelationValue } from './DataExtensionRelationValue';
import { DataExtensionValueInput } from './DataExtensionValueInput';
import { groupFields } from '../utils/fieldDisplay';

/** Typed into, so saved when focus leaves the field or on Enter. */
const SAVE_ON_BLUR: IDataExtensionField['type'][] = [
  'text',
  'longText',
  'number',
  'email',
  'url',
  'phone',
  'currency',
  'percent',
  'address',
  'fullName',
  'links',
  'emails',
  'phones',
  'json',
  'dateTime',
];

/** Values taller than one row: their label sits at the top of the row. */
const TALL_TYPES: IDataExtensionField['type'][] = [
  'longText',
  'multiSelect',
  'address',
  'fullName',
  'links',
  'emails',
  'phones',
  'files',
  'json',
];

/** How long the saved check stays before it fades out. */
const SAVED_VISIBLE_MS = 1600;

/** The side panel's row: label column, value, and a slot for save state. */
const ROW_CLASS_NAME =
  'grid grid-cols-[6.5rem_minmax(0,1fr)_1rem] gap-x-2 gap-y-0.5 min-h-7';

const sameValue = (a: DataExtensionValue, b: DataExtensionValue) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Saving, then a check that fades after a moment: confirms the write
 * without leaving a lasting badge on every row the user touched.
 */
const SaveState = ({
  saving,
  saved,
  error,
}: {
  saving: boolean;
  saved: boolean;
  error: string | null;
}) => {
  const { t } = useTranslation('dataExtensions');
  const reduceMotion = useReducedMotion();
  const appear = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, scale: 0.6 },
        animate: { opacity: 1, scale: 1 },
      };

  return (
    <span
      className="flex size-4 items-center justify-center"
      aria-live="polite"
    >
      <AnimatePresence initial={false} mode="wait">
        {saving && (
          <motion.span key="saving" {...appear} exit={{ opacity: 0 }}>
            <Spinner size="sm" />
          </motion.span>
        )}
        {!saving && error && (
          <motion.span
            key="error"
            {...appear}
            exit={{ opacity: 0 }}
            className="text-destructive"
          >
            <IconAlertCircle className="size-3.5" aria-hidden="true" />
          </motion.span>
        )}
        {!saving && !error && saved && (
          <motion.span
            key="saved"
            {...appear}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-success"
          >
            <IconCheck className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{t('inline.saved')}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

/**
 * One field edited in place and saved on its own, the way Twenty persists
 * a field: typed values when focus leaves it, picked values right away.
 * Laid out like the side panel's own fields.
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
  const [draft, setDraft] = useState<DataExtensionValue>(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveOnBlur = !field.relation && SAVE_ON_BLUR.includes(field.type);
  const tall = Boolean(field.relation) || TALL_TYPES.includes(field.type);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timer = setTimeout(() => setSaved(false), SAVED_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [saved]);

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
    <div className={cn(ROW_CLASS_NAME, tall ? 'items-start' : 'items-center')}>
      <DataExtensionFieldLabel
        field={field}
        htmlFor={inputId}
        className={tall ? 'pt-1.5' : 'self-center'}
      />
      <fieldset
        disabled={readOnly || saving}
        className="min-w-0 transition-opacity disabled:opacity-70"
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      >
        {isComputedField(field) ? (
          <DataExtensionValueDisplay
            field={displayFieldOf(field)}
            value={value}
            className="block truncate py-1 text-xs"
          />
        ) : field.relation ? (
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
            compact
          />
        )}
      </fieldset>
      <span className={tall ? 'pt-1.5' : 'self-center'}>
        <SaveState saving={saving} saved={saved} error={error} />
      </span>
      {error && (
        <p
          className="col-start-2 col-end-4 text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

/** Rows of the panel's shape while a record's values load. */
const FieldRowsSkeleton = ({ rows }: { rows: number }) => (
  <div className="flex flex-col gap-1.5" aria-hidden="true">
    {Array.from({ length: Math.min(rows, 4) }, (_, index) => (
      <div key={index} className={cn(ROW_CLASS_NAME, 'items-center')}>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-full rounded-sm" />
      </div>
    ))}
  </div>
);

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
  const { hasActionPermission } = usePermissionCheck();
  const canManage = hasActionPermission('dataExtensionsManage');
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
      <p
        className="flex items-center gap-1.5 text-xs text-destructive"
        role="alert"
      >
        <IconAlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
        {error.message}
      </p>
    );
  }

  if (!record) {
    return <FieldRowsSkeleton rows={fields.length} />;
  }

  const onSave = async (key: string, value: DataExtensionValue) => {
    await save({ [key]: value });
  };

  // Restricted values are hidden from, and read-only values locked for,
  // anyone who is not a Data Extensions manager; the server enforces both.
  const lockedFor = (field: IDataExtensionField) =>
    readOnly ||
    isComputedField(field) ||
    (!canManage &&
      (field.settings?.readOnly || field.settings?.access === 'managers'));
  const shown = (field: IDataExtensionField) =>
    isFieldVisible(field, record.values) &&
    (canManage || field.settings?.access !== 'managers');

  return (
    <section className="flex flex-col gap-1.5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
      {showLabel && (
        <h4 className="pb-0.5 text-xs font-medium text-muted-foreground">
          {descriptor.label}
        </h4>
      )}
      {groupFields(fields).map(({ group, items }) => (
        <div key={group || ''} className="flex flex-col gap-1.5">
          {group && (
            <h5 className="pt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {group}
            </h5>
          )}
          {items.filter(shown).map((field) => (
            <DataExtensionInlineField
              key={field._id}
              field={field}
              value={record.values[field.key] ?? null}
              links={record.links[field.key] || []}
              editable={record.editableLinks.includes(field.key)}
              readOnly={lockedFor(field)}
              inputId={`data-extensions-${recordId}-${field.key}`}
              onSave={onSave}
            />
          ))}
        </div>
      ))}
    </section>
  );
};


/**
 * Every Data Extension field that applies to a record, from the current
 * definitions: the record types registered for its content type, read and
 * saved through the tenant endpoint. Used by the record side panel, so no
 * module page lists its fields itself.
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
    return <FieldRowsSkeleton rows={3} />;
  }

  return (
    <div className={cn('flex flex-col gap-5', className)}>
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
