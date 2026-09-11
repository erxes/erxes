import {
  IconAlertTriangle,
  IconArrowRight,
  IconBan,
  IconCheck,
  IconCircleCheck,
  IconHelpCircle,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Popover,
  ScrollArea,
  Sheet,
  Skeleton,
  Spinner,
  cn,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IGNORE_COLUMN,
  useImportColumnMapping,
} from '../../hooks/import/useImportColumnMapping';
import {
  TImportPreviewColumn,
  TImportPreviewField,
} from '../../types/import/importTypes';
import { ImportFieldFormat } from './ImportFieldFormat';
import { useImport } from './ImportProvider';

const STATUS_BADGE: Record<
  TImportPreviewColumn['status'],
  { variant: 'success' | 'warning' | 'secondary' }
> = {
  matched: { variant: 'success' },
  suggested: { variant: 'warning' },
  unmatched: { variant: 'secondary' },
};

const FieldPicker = ({
  value,
  fields,
  isDuplicate,
  onSelect,
}: {
  value: string;
  fields: TImportPreviewField[];
  isDuplicate: boolean;
  onSelect: (key: string) => void;
}) => {
  const { t } = useTranslation('importExport');
  const [open, setOpen] = useState(false);
  const selected = fields.find((field) => field.key === value);

  const handleSelect = (key: string) => {
    onSelect(key);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger
        className={cn(
          'w-full',
          isDuplicate && 'border-destructive text-destructive',
          value === IGNORE_COLUMN && 'text-muted-foreground',
        )}
      >
        {selected?.label || t('do-not-import')}
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('search-field')} />
          <Command.List className="max-h-72 p-1">
            <Combobox.Empty />
            <Command.Item
              value="do not import skip ignore"
              className="cursor-pointer"
              onSelect={() => handleSelect(IGNORE_COLUMN)}
            >
              <IconBan className="size-4 text-muted-foreground" />
              {t('do-not-import')}
              {value === IGNORE_COLUMN && (
                <IconCheck className="ml-auto size-4" />
              )}
            </Command.Item>
            {fields.map((field) => (
              <Command.Item
                key={field.key}
                value={`${field.label} ${field.key}`}
                className="cursor-pointer"
                onSelect={() => handleSelect(field.key)}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{field.label}</span>
                  <ImportFieldFormat field={field} />
                </div>
                {value === field.key && (
                  <IconCheck className="ml-auto size-4 shrink-0" />
                )}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const ColumnRow = ({
  column,
  fields,
  fieldByKey,
  selectedKey,
  isDuplicate,
  onSelect,
}: {
  column: TImportPreviewColumn;
  fields: TImportPreviewField[];
  fieldByKey: Record<string, TImportPreviewField>;
  selectedKey: string;
  isDuplicate: boolean;
  onSelect: (key: string) => void;
}) => {
  const { t } = useTranslation('importExport');
  const badge = STATUS_BADGE[column.status];

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 border-b px-1 py-3 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 truncate text-sm font-medium">
            {column.header || t('column-fallback', { index: column.index + 1 })}
          </span>
          <Badge variant={badge.variant} className="text-[10px]">
            {t(`match-${column.status}`)}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {column.sampleValues.length
            ? column.sampleValues.slice(0, 3).join(' · ')
            : t('no-sample-values')}
        </p>
      </div>

      <IconArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 space-y-1">
        <FieldPicker
          value={selectedKey}
          fields={fields}
          isDuplicate={isDuplicate}
          onSelect={onSelect}
        />
        {isDuplicate ? (
          <span className="text-xs text-destructive">
            {t('duplicate-field')}
          </span>
        ) : (
          <ImportFieldFormat field={fieldByKey[selectedKey]} />
        )}
      </div>
    </div>
  );
};

export const ImportColumnMappingSheet = () => {
  const { t } = useTranslation('importExport');
  const { contentType, pendingUpload, clearPendingUpload } = useImport();

  const {
    columns,
    fields,
    fieldByKey,
    selection,
    selectColumn,
    resetToSuggestions,
    duplicateKeys,
    missingRequiredFields,
    mappedCount,
    ignoredCount,
    totalRows,
    loading,
    error,
    isStarting,
    canStart,
    handleStart,
  } = useImportColumnMapping({
    entityType: contentType,
    pendingUpload,
    onFinished: clearPendingUpload,
  });

  return (
    <Sheet
      open={!!pendingUpload}
      onOpenChange={(open) => !open && clearPendingUpload()}
    >
      <Sheet.View className="flex w-full flex-col sm:w-[560px]">
        <Sheet.Header>
          <Sheet.Title>{t('match-columns')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="min-h-0 flex-1 p-0">
          <ScrollArea
            className="h-full"
            viewportClassName="[&>div]:block! [&>div]:min-w-0"
          >
            <div className="space-y-4 p-4">
              <div className="rounded-xl border bg-muted/20 px-4 py-3">
                <p className="truncate text-sm font-medium">
                  {pendingUpload?.fileName}
                </p>
                {loading ? (
                  <Skeleton className="mt-2 h-4 w-48" />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t('mapping-summary', {
                      total: totalRows.toLocaleString(),
                      mapped: mappedCount,
                      skipped: ignoredCount,
                    })}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{error.message}</p>
                </div>
              )}

              {!!duplicateKeys.size && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">
                    {t('duplicate-warning')}
                  </p>
                </div>
              )}

              {!!missingRequiredFields.length && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">
                    {t('missing-required', {
                      fields: missingRequiredFields
                        .map((field) => field.label)
                        .join(', '),
                    })}
                  </p>
                </div>
              )}

              {!loading && !error && !columns.length && (
                <div className="flex items-start gap-2 rounded-xl border px-4 py-3">
                  <IconHelpCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('no-header-row')}
                  </p>
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border px-3">
                  {columns.map((column) => (
                    <ColumnRow
                      key={column.index}
                      column={column}
                      fields={fields}
                      fieldByKey={fieldByKey}
                      selectedKey={selection[column.index] || IGNORE_COLUMN}
                      isDuplicate={
                        !!selection[column.index] &&
                        duplicateKeys.has(selection[column.index])
                      }
                      onSelect={(key) => selectColumn(column.index, key)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="gap-2">
          <Button
            variant="ghost"
            onClick={resetToSuggestions}
            disabled={loading || isStarting || !columns.length}
          >
            {t('reset-to-suggestions')}
          </Button>
          <Button variant="outline" onClick={clearPendingUpload}>
            {t('cancel')}
          </Button>
          <Button onClick={handleStart} disabled={!canStart}>
            {isStarting ? (
              <Spinner size="sm" />
            ) : (
              <IconCircleCheck className="size-4" />
            )}
            {t('import-rows', { total: totalRows })}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
