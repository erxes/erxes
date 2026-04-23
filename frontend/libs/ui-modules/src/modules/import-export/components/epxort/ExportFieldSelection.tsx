import { IconCheck, IconMinus } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Command,
  Combobox,
  Sheet,
  ScrollArea,
} from 'erxes-ui';
import { Badge } from 'erxes-ui/components/badge';
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
}: Readonly<TSearchAndActionsProps>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          <IconCheck className="w-4 h-4 mr-1.5" />
          Select all
        </Button>
        <Button variant="outline" size="sm" onClick={onDeselectAll}>
          <IconMinus className="w-4 h-4 mr-1.5" />
          Clear all
        </Button>
        <Button variant="outline" size="sm" onClick={onSelectDefaults}>
          Use suggested fields
        </Button>
      </div>
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {selectedCount} of {totalCount} fields selected
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
}: Readonly<TExportFieldSelectionProps>) {
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
    return getEntityLabelFromType(entityType, {
      plural: true,
      capitalize: true,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View>
        <Sheet.Header>
          <div>
            <div className="flex items-center gap-2">
              <Sheet.Title>Export {getEntityName()}</Sheet.Title>
              <Badge variant="info">CSV</Badge>
            </div>
            <Sheet.Description>
              Choose the fields to include in your export file.
              {recordCount !== undefined &&
                ` ${recordCount} selected records will be exported.`}
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="px-2 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col min-h-0 flex-1">
            <Command className="flex-1 overflow-hidden flex flex-col min-h-0">
              <Command.Input
                variant="primary"
                placeholder="Search fields by name..."
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
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-sm font-medium">
                                  {header.label}
                                </span>
                                <p className="truncate text-xs text-muted-foreground">
                                  {header.key}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-1">
                                {header.type === 'customProperty' && (
                                  <Badge variant="secondary">Custom</Badge>
                                )}
                                {header.isDefault && (
                                  <Badge variant="default">Suggested</Badge>
                                )}
                              </div>
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
            Create CSV export ({selectedFields.length} fields)
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
}
