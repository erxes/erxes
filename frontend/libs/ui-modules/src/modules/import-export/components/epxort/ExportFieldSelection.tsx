import { useTranslation } from 'react-i18next';
import { IconCheck, IconMinus } from '@tabler/icons-react';
import { Badge, Button, Checkbox, Command, Combobox, Sheet } from 'erxes-ui';
import { useExportFieldSelection } from '../../hooks/export/useExportFieldSelection';
import {
  TExportFieldSelectionProps,
  TSearchAndActionsProps,
} from '../../types/export/exportTypes';
import { useEntityLabel } from '../../hooks/useEntityLabel';

export function SearchAndActions({
  onSelectAll,
  onDeselectAll,
  onSelectDefaults,
  selectedCount,
  totalCount,
}: TSearchAndActionsProps) {
  const { t } = useTranslation('importExport');

  return (
    <div className="flex items-center gap-1 border-b p-2">
      <Button variant="ghost" size="sm" onClick={onSelectDefaults}>
        {t('suggested')}
      </Button>
      <Button variant="ghost" size="sm" onClick={onSelectAll}>
        <IconCheck />
        {t('select-all')}
      </Button>
      <Button variant="ghost" size="sm" onClick={onDeselectAll}>
        <IconMinus />
        {t('clear')}
      </Button>
      <span className="ml-auto px-2 text-xs text-muted-foreground">
        {t('fields-selected', { selected: selectedCount, total: totalCount })}
      </span>
    </div>
  );
}

export function ExportFieldSelection({
  entityType,
  open,
  onOpenChange,
  onConfirm,
  recordCount,
  entityDisplayName,
  filters,
}: TExportFieldSelectionProps) {
  const { t } = useTranslation('importExport');
  const {
    selectedFields,
    headers,
    handleConfirm,
    loading,
    handleDeselectAll,
    handleSelectAll,
    handleSelectDefaults,
    handleToggleField,
  } = useExportFieldSelection({
    entityType,
    filters,
    open,
    onConfirm,
    onOpenChange,
  });

  const derivedEntityLabel = useEntityLabel(
    entityType.split('.').pop() || 'record',
    { plural: true, capitalize: true },
  );
  const entityName = entityDisplayName || derivedEntityLabel;

  const systemHeaders = headers.filter((h) => h.type !== 'customProperty');
  const customHeaders = headers.filter((h) => h.type === 'customProperty');

  const renderItem = (header: (typeof headers)[number]) => {
    const isSelected = selectedFields.includes(header.key);
    const searchValue = `${header.label} ${header.key}`.trim();
    return (
      <Command.Item
        key={header.key}
        value={searchValue}
        className="cursor-pointer"
        onSelect={() => handleToggleField(header.key)}
      >
        <Checkbox
          checked={isSelected}
          className="pointer-events-none"
          aria-label={header.label}
        />
        <span className="min-w-0 flex-1 truncate">{header.label}</span>
        {header.isDefault && (
          <Badge variant="secondary">{t('suggested')}</Badge>
        )}
      </Command.Item>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title className="flex items-center gap-2">
            {t('export-entity', { entity: entityName })}
            <Badge variant="secondary">CSV</Badge>
          </Sheet.Title>
          <Sheet.Description className="sr-only">
            {t('export-fields-description')}
            {recordCount !== undefined &&
              ` ${t('export-selected-records-note', { total: recordCount })}`}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex min-h-0 flex-col overflow-hidden">
          <Command className="flex min-h-0 flex-1 flex-col">
            <Command.Input
              variant="primary"
              placeholder={t('search-fields-by-name')}
            />
            <SearchAndActions
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onSelectDefaults={handleSelectDefaults}
              selectedCount={selectedFields.length}
              totalCount={headers.length}
            />
            <Command.List className="max-h-none min-h-0 flex-1 overflow-y-auto p-1">
              <Combobox.Empty loading={loading} />
              <Command.Group heading={t('system-fields')}>
                {systemHeaders.map(renderItem)}
              </Command.Group>
              {customHeaders.length > 0 && (
                <Command.Group heading={t('custom-properties')}>
                  {customHeaders.map(renderItem)}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Sheet.Content>

        <Sheet.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || selectedFields.length === 0}
          >
            {t('create-csv-export', { total: selectedFields.length })}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
}
