import { IconAlertTriangle, IconSearch } from '@tabler/icons-react';
import { Badge, Input, Skeleton } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImportFields } from '../../hooks/import/useImportFields';
import { TImportPreviewField } from '../../types/import/importTypes';
import { ImportFieldFormat } from './ImportFieldFormat';
import { useImport } from './ImportProvider';

const matchesSearch = (field: TImportPreviewField, search: string) => {
  if (!search) {
    return true;
  }

  const haystack = [field.label, field.key, field.example, ...field.options]
    .join(' ')
    .toLowerCase();

  return haystack.includes(search);
};

const FieldRow = ({ field }: { field: TImportPreviewField }) => {
  const { t } = useTranslation('importExport');

  return (
    <div className="flex items-start justify-between gap-3 border-b px-1 py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm">{field.label}</p>
        <ImportFieldFormat field={field} />
      </div>
      {field.required && (
        <Badge variant="warning" className="shrink-0 text-[10px]">
          {t('required')}
        </Badge>
      )}
    </div>
  );
};

const FieldGroup = ({
  title,
  fields,
}: {
  title: string;
  fields: TImportPreviewField[];
}) => {
  if (!fields.length) {
    return null;
  }

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="rounded-lg border px-3">
        {fields.map((field) => (
          <FieldRow key={field.key} field={field} />
        ))}
      </div>
    </div>
  );
};

/**
 * The column names and value formats this entity accepts, readable before a
 * file exists — the mapping step shows the same thing, but only once a file
 * has been uploaded, which is after the spreadsheet is already filled in.
 *
 * Sits at the bottom of the sheet and claims whatever height is left, so the
 * list scrolls on its own instead of pushing the drop zone out of view.
 */
export const ImportFieldReference = () => {
  const { t } = useTranslation('importExport');
  const { contentType } = useImport();
  const [search, setSearch] = useState('');
  const { systemFields, customFields, loading, error } =
    useImportFields(contentType);

  const normalizedSearch = search.trim().toLowerCase();

  const [matchedSystem, matchedCustom] = useMemo(
    () => [
      systemFields.filter((field) => matchesSearch(field, normalizedSearch)),
      customFields.filter((field) => matchesSearch(field, normalizedSearch)),
    ],
    [systemFields, customFields, normalizedSearch],
  );

  const hasMatches = !!matchedSystem.length || !!matchedCustom.length;

  return (
    <section className="flex min-h-0 flex-1 flex-col border-t">
      <div className="shrink-0 space-y-2 px-4 pt-3 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('field-formats')}
        </p>

        {!error && (
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder={t('search-fields')}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {loading && (
        <div className="space-y-2 px-4 pb-4">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {error && (
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {hasMatches ? (
            <>
              <FieldGroup title={t('standard-fields')} fields={matchedSystem} />
              <FieldGroup
                title={t('custom-properties')}
                fields={matchedCustom}
              />
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('no-field-matches', { search })}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
