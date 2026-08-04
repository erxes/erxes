import { IconCheck, IconMinus } from '@tabler/icons-react';
import { Badge, Button, Checkbox, Command, Combobox, Sheet } from 'erxes-ui';
import { useExportFieldSelection } from '../../hooks/export/useExportFieldSelection';
import {
  TExportFieldSelectionProps,
  TSearchAndActionsProps,
} from '../../types/export/exportTypes';
import { getEntityLabelFromType } from '../../utils/entityLabel';

export function SearchAndActions({
  onSelectAll,
  onDeselectAll,
  onSelectDefaults,
  selectedCount,
  totalCount,
}: TSearchAndActionsProps) {
  return (
    <div className="flex items-center gap-1 border-b p-2">
      <Button variant="ghost" size="sm" onClick={onSelectDefaults}>
        Suggested
      </Button>
      <Button variant="ghost" size="sm" onClick={onSelectAll}>
        <IconCheck />
        Select all
      </Button>
      <Button variant="ghost" size="sm" onClick={onDeselectAll}>
        <IconMinus />
        Clear
      </Button>
      <span className="ml-auto px-2 text-xs text-muted-foreground">
        {selectedCount} of {totalCount} fields selected
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

  // If entityDisplayName is provided, use it; otherwise, derive the name from entityType
  const getEntityName = () => {
    if (entityDisplayName) return entityDisplayName;
    return getEntityLabelFromType(entityType, {
      plural: true,
      capitalize: true,
    });
  };

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
        {header.isDefault && <Badge variant="secondary">Suggested</Badge>}
      </Command.Item>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title className="flex items-center gap-2">
            Export {getEntityName()}
            <Badge variant="secondary">CSV</Badge>
          </Sheet.Title>
          <Sheet.Description className="sr-only">
            Choose the fields to include in your export file.
            {recordCount !== undefined &&
              ` ${recordCount} selected records will be exported.`}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex min-h-0 flex-col overflow-hidden">
          <Command className="flex min-h-0 flex-1 flex-col">
            <Command.Input
              variant="primary"
              placeholder="Search fields by name..."
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
              <Command.Group heading="System Fields">
                {systemHeaders.map(renderItem)}
              </Command.Group>
              {customHeaders.length > 0 && (
                <Command.Group heading="Custom Properties">
                  {customHeaders.map(renderItem)}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Sheet.Content>

        <Sheet.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || selectedFields.length === 0}
          >
            Create CSV export ({selectedFields.length} fields)
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
}
