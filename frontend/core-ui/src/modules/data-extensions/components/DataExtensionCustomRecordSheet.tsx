import { gql, useApolloClient } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  Input,
  Label,
  Sheet,
  Skeleton,
  Spinner,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildCreateMutation,
  buildDeleteMutation,
  buildRecordQuery,
  buildUpdateMutation,
  DataExtensionFieldsEditor,
  DataExtensionRecordFields,
  DataExtensionValue,
  IDataExtensionRecordType,
  isEmptyDataExtensionValue,
  isRequiredField,
  showsInCreate,
  typedRequestOptions,
  useDataExtensionFields,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { useDataExtensionPermissions } from '../hooks/useDataExtensionPermissions';
import { DataExtensionObjectIcon } from './DataExtensionObjectIcon';
import { DataExtensionRecordHistory } from './DataExtensionRecordHistory';

const defaultsOf = (
  fields: ReturnType<typeof useDataExtensionFields>['fields'],
): Record<string, DataExtensionValue> =>
  Object.fromEntries(
    fields
      .filter(
        (field) =>
          field.settings?.defaultValue !== undefined &&
          field.settings?.defaultValue !== null,
      )
      .map((field) => [field.key, field.settings?.defaultValue ?? null]),
  );

/**
 * Opens one custom object record (rename, edit each field in place,
 * delete) or creates a new one with its values in a single write.
 */
export const DataExtensionCustomRecordSheet = ({
  recordType,
  recordId,
  creating,
  onClose,
  onChanged,
  onCreated,
}: {
  recordType: IDataExtensionRecordType;
  recordId: string | null;
  creating: boolean;
  onClose: () => void;
  onChanged: () => void;
  onCreated: (id: string) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const { canManageRecords } = useDataExtensionPermissions();
  const { fields } = useDataExtensionFields({
    recordType: recordType.recordType,
  });
  const { recordTypes } = useDataExtensionRecordTypes();
  const createFields = useMemo(() => fields.filter(showsInCreate), [fields]);
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [values, setValues] = useState<Record<string, DataExtensionValue>>({});
  const [loadingName, setLoadingName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const open = creating || Boolean(recordId);
  const singular = recordType.singularLabel || recordType.label;

  useEffect(() => {
    if (creating) {
      setName('');
      setSubmitted(false);
      setValues(defaultsOf(createFields));
    }
  }, [creating, createFields]);

  useEffect(() => {
    if (!recordId) {
      return;
    }

    let cancelled = false;

    setLoadingName(true);
    client
      .query<{ record: { name?: string } | null }>({
        query: gql(buildRecordQuery(recordType, [], recordTypes)),
        variables: { _id: recordId },
        ...typedRequestOptions,
      })
      .then(({ data }) => {
        if (!cancelled) {
          setName(data.record?.name || '');
          setSavedName(data.record?.name || '');
        }
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoadingName(false));

    return () => {
      cancelled = true;
    };
  }, [recordId, client, recordType, recordTypes]);

  const missingRequired = createFields.filter(
    (field) => isRequiredField(field) && isEmptyDataExtensionValue(values[field.key]),
  );

  const create = async () => {
    setSubmitted(true);

    if (!name.trim() || missingRequired.length) {
      return;
    }

    setBusy(true);

    try {
      const filled = Object.fromEntries(
        Object.entries(values).filter(
          ([, value]) => !isEmptyDataExtensionValue(value),
        ),
      );
      const { data } = await client.mutate<{ record: { _id: string } }>({
        mutation: gql(buildCreateMutation(recordType, fields, recordTypes)),
        variables: {
          input: {
            name: name.trim(),
            ...(fields.length ? { values: filled } : {}),
          },
        },
        ...typedRequestOptions,
      });

      toast({
        variant: 'success',
        title: t('records.created', { label: singular }),
      });
      onChanged();

      if (data?.record._id) {
        onCreated(data.record._id);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('records.create-failed', { label: singular }),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const rename = async () => {
    const next = name.trim();

    if (!recordId || !next || next === savedName) {
      setName(savedName);
      return;
    }

    try {
      await client.mutate({
        mutation: gql(buildUpdateMutation(recordType, [], recordTypes)),
        variables: { _id: recordId, input: { name: next } },
        ...typedRequestOptions,
      });
      setSavedName(next);
      onChanged();
    } catch (error) {
      setName(savedName);
      toast({
        variant: 'destructive',
        title: t('records.update-failed'),
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const remove = () =>
    confirm({
      message: t('records.delete-confirm', { name: savedName || singular }),
      options: {
        description: t('records.delete-confirm-description'),
        okLabel: t('delete'),
        variants: { ok: 'destructive' },
      },
    }).then(async () => {
      if (!recordId) {
        return;
      }

      try {
        await client.mutate({
          mutation: gql(buildDeleteMutation(recordType)),
          variables: { _id: recordId },
          ...typedRequestOptions,
        });
        toast({
          variant: 'success',
          title: t('records.deleted', { name: savedName }),
        });
        onChanged();
        onClose();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t('records.delete-failed'),
          description: error instanceof Error ? error.message : undefined,
        });
      }
    });

  const nameError = submitted && !name.trim();

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <Sheet.View className="p-0 sm:max-w-xl">
        <Sheet.Header>
          <Sheet.Title className="flex items-center gap-2">
            <DataExtensionObjectIcon icon={recordType.icon} />
            {creating ? t('records.new', { label: singular }) : singular}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col gap-5 overflow-y-auto p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data-extensions-record-name">
              {t('records.name')}
              <span className="ml-0.5 text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            {loadingName ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Input
                id="data-extensions-record-name"
                autoFocus={creating}
                value={name}
                disabled={!canManageRecords}
                aria-invalid={nameError}
                placeholder={t('records.name-placeholder', { label: singular })}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => !creating && rename()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    creating ? create() : rename();
                  }
                }}
              />
            )}
            {nameError && (
              <p className="text-xs text-destructive" role="alert">
                {t('records.name-required')}
              </p>
            )}
          </div>

          {creating ? (
            createFields.length > 0 && (
              <div className="flex flex-col gap-2">
                <DataExtensionFieldsEditor
                  fields={createFields}
                  values={values}
                  idPrefix={`data-extensions-new-${recordType.typeName}`}
                  layout="stack"
                  onChange={(key, value) =>
                    setValues((current) => ({ ...current, [key]: value }))
                  }
                />
                {submitted && missingRequired.length > 0 && (
                  <p className="text-xs text-destructive" role="alert">
                    {t('records.required-missing', {
                      fields: missingRequired.map((field) => field.label).join(', '),
                    })}
                  </p>
                )}
              </div>
            )
          ) : (
            recordId && (
              <>
                <DataExtensionRecordFields
                  contentType={recordType.recordType}
                  recordId={recordId}
                  readOnly={!canManageRecords}
                />
                <DataExtensionRecordHistory
                  recordType={recordType.recordType}
                  recordId={recordId}
                  fields={fields}
                />
              </>
            )
          )}
        </Sheet.Content>
        <Sheet.Footer>
          {!creating && canManageRecords && (
            <Button
              variant="ghost"
              className="mr-auto text-destructive"
              onClick={remove}
            >
              <IconTrash />
              {t('delete')}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            {creating ? t('cancel') : t('records.close')}
          </Button>
          {creating && (
            <Button onClick={create} disabled={busy}>
              {busy && <Spinner size="sm" />}
              {t('records.create', { label: singular })}
            </Button>
          )}
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
