import { IconDatabaseSearch, IconSearch } from '@tabler/icons-react';
import { Button, Input, Label, Spinner, toast } from 'erxes-ui';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  canPickRecordType,
  DataExtensionFieldsEditor,
  DataExtensionRecordPicker,
  DataExtensionValue,
  IDataExtensionRecordResult,
  IDataExtensionRecordType,
  useDataExtensionFields,
  useDataExtensionRecord,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { useDataExtensionPermissions } from '../hooks/useDataExtensionPermissions';
import {
  DataExtensionEmptyState,
  DataExtensionErrorState,
} from './DataExtensionStates';

const sameValue = (a: DataExtensionValue, b: DataExtensionValue) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const describeRecord = (record: IDataExtensionRecordResult) =>
  Object.values(record.summary)
    .filter((value) => typeof value === 'string' && value)
    .join(' · ');

export const DataExtensionRecordValues = ({
  recordType,
}: {
  recordType: IDataExtensionRecordType;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { canManage } = useDataExtensionPermissions();
  const { fields, loading: fieldsLoading } = useDataExtensionFields({
    recordType: recordType.recordType,
  });
  const { recordTypes } = useDataExtensionRecordTypes();
  const { record, notFound, loading, saving, error, load, save, reset } =
    useDataExtensionRecord(recordType, fields, recordTypes);
  const [recordId, setRecordId] = useState('');
  const [draft, setDraft] = useState<Record<string, DataExtensionValue>>({});
  const [pasteId, setPasteId] = useState(false);
  const reduceMotion = useReducedMotion();
  const pickable =
    canPickRecordType(recordType.recordType, recordTypes) && !pasteId;

  useEffect(() => {
    reset();
    setRecordId('');
  }, [recordType.recordType, reset]);

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

  const onLookup = (event: FormEvent) => {
    event.preventDefault();

    if (recordId.trim()) {
      load(recordId.trim());
    }
  };

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

  if (fieldsLoading && !fields.length) {
    return <Spinner />;
  }

  if (!fields.length) {
    return (
      <DataExtensionEmptyState
        icon={<IconDatabaseSearch />}
        title={t('empty.values-title')}
        description={t('empty.values-description')}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-5">
        {pickable ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="data-extensions-record-picker">
              {t('values.find-record', {
                label: t(
                  `record-types.${recordType.recordType}`,
                  recordType.label,
                ),
              })}
            </Label>
            <DataExtensionRecordPicker
              id="data-extensions-record-picker"
              recordType={recordType.recordType}
              mode="single"
              value={recordId || undefined}
              onChange={(next) => {
                const picked = Array.isArray(next) ? next[0] : next;

                if (picked) {
                  setRecordId(picked);
                  load(picked);
                }
              }}
            />
            <button
              type="button"
              className="self-start text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => setPasteId(true)}
            >
              {t('values.paste-id-instead')}
            </button>
          </div>
        ) : (
          <form onSubmit={onLookup} className="flex flex-col gap-2">
            <Label htmlFor="data-extensions-record-id">
              {t('values.record-id')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="data-extensions-record-id"
                className="font-mono"
                value={recordId}
                placeholder={t('values.record-id-placeholder')}
                onChange={(event) => setRecordId(event.target.value)}
              />
              <Button type="submit" variant="outline" disabled={loading}>
                {loading ? <Spinner size="sm" /> : <IconSearch />}
                {t('values.load')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('values.record-id-hint')}
            </p>
            {canPickRecordType(recordType.recordType, recordTypes) && (
              <button
                type="button"
                className="self-start text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                onClick={() => setPasteId(false)}
              >
                {t('values.search-instead')}
              </button>
            )}
          </form>
        )}

        {error && (
          <DataExtensionErrorState
            error={error}
            onRetry={() => load(recordId.trim())}
          />
        )}

        {notFound && (
          <p
            className="rounded-md border border-dashed p-4 text-sm text-muted-foreground"
            role="status"
          >
            {t('values.not-found', {
              label: t(
                `record-types.${recordType.recordType}`,
                recordType.label,
              ),
            })}
          </p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {record && (
            <motion.section
              key={record._id}
              // A short rise marks that a different record is now loaded.
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="flex flex-col gap-5 rounded-lg border p-5"
              aria-labelledby="data-extensions-record-heading"
            >
              <header className="flex flex-col gap-1">
                <h2
                  id="data-extensions-record-heading"
                  className="text-base font-semibold"
                >
                  {describeRecord(record) || record._id}
                </h2>
                <code className="text-xs text-muted-foreground">
                  {record._id}
                </code>
              </header>
              <DataExtensionFieldsEditor
                fields={fields}
                values={draft}
                links={record.links}
                editableLinks={record.editableLinks}
                disabled={!canManage || saving}
                onChange={(key, value) =>
                  setDraft((current) => ({ ...current, [key]: value }))
                }
              />
              {canManage && (
                <footer className="flex items-center justify-end gap-2 border-t pt-4">
                  <span className="mr-auto text-xs text-muted-foreground">
                    {changeCount
                      ? t('values.unsaved', { count: changeCount })
                      : t('values.no-changes')}
                  </span>
                  <Button
                    variant="ghost"
                    disabled={!changeCount || saving}
                    onClick={() => setDraft(record.values)}
                  >
                    {t('values.discard')}
                  </Button>
                  <Button disabled={!changeCount || saving} onClick={onSave}>
                    {saving && <Spinner size="sm" />}
                    {t('values.save')}
                  </Button>
                </footer>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
