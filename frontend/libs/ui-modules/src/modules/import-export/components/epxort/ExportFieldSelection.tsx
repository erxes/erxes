import { IconCheck, IconMinus, IconInfoCircle } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Command,
  Combobox,
  Sheet,
  ScrollArea,
} from 'erxes-ui';
import { useExportFieldSelection } from '../../hooks/export/useExportFieldSelection';
import {
  TExportFieldSelectionProps,
  TSearchAndActionsProps,
} from '../../types/export/exportTypes';

export function SearchAndActions({
  onSelectAll,
  onDeselectAll,
  onSelectDefaults,
  selectedCount,
  totalCount,
}: TSearchAndActionsProps) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          <IconCheck className="w-4 h-4 mr-1.5" />
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={onDeselectAll}>
          <IconMinus className="w-4 h-4 mr-1.5" />
          Deselect All
        </Button>
        <Button variant="outline" size="sm" onClick={onSelectDefaults}>
          Reset to Defaults
        </Button>
      </div>
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {selectedCount} of {totalCount}
      </div>
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
  } = useExportFieldSelection({ entityType, onConfirm, onOpenChange });

  const getEntityName = () => {
    if (entityDisplayName) return entityDisplayName;
    const parts = entityType.split('.');
    const collectionName = parts[parts.length - 1] || 'Records';
    return collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View>
        <Sheet.Header>
          <div>
            <div className="flex items-center gap-2">
              <Sheet.Title>Export {getEntityName()}</Sheet.Title>
              <IconInfoCircle className="size-4 text-muted-foreground" />
            </div>
            <Sheet.Description>
              Select the fields to include in your export file.
              {recordCount !== undefined &&
                ` ${recordCount} records will be exported.`}
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="px-2 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col min-h-0 flex-1">
            <Command className="flex-1 overflow-hidden flex flex-col min-h-0">
              <Command.Input
                variant="primary"
                placeholder="Search fields by name or description..."
              />
              <div className="flex-shrink-0 py-2">
                <SearchAndActions
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onSelectDefaults={handleSelectDefaults}
                  selectedCount={selectedFields.length}
                  totalCount={headers.length}
                />
              </div>
              <Command.List className="flex-1 overflow-y-auto h-full max-h-full p-1">
                <Combobox.Empty loading={loading} />
                <ScrollArea>
                  {headers.map((header) => {
                    const isSelected = selectedFields.includes(header.key);
                    const searchValue = `${header.label} ${header.key}`.trim();
                    return (
                      <Command.Item
                        key={header.key}
                        value={searchValue}
                        className="cursor-pointer py-2"
                        onSelect={() => handleToggleField(header.key)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div
                            className="mt-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleField(header.key);
                            }}
                          >
                            <Checkbox checked={isSelected} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-sm font-medium">
                                {header.label}
                              </span>
                              {header.isDefault && (
                                <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Command.Item>
                    );
                  })}
                </ScrollArea>
              </Command.List>
            </Command>
          </div>
        </Sheet.Content>

        <Sheet.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            Export ({selectedFields.length} fields)
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
}
