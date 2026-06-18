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
}: TSearchAndActionsProps) {
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
  } = useExportFieldSelection({ entityType, filters, open, onConfirm, onOpenChange });

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
        className="cursor-pointer py-2 !overflow-visible !h-auto"
        onSelect={() => handleToggleField(header.key)}
      >
        <div className="flex items-start gap-3 w-full">
          <div
            className="mt-0.5 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleField(header.key);
            }}
          >
            <Checkbox checked={isSelected} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 min-w-0 text-sm font-medium leading-snug break-words">
                {header.label}
              </span>
              <div className="flex-shrink-0 flex flex-wrap items-start gap-1 pt-px">
                {header.isDefault && (
                  <Badge variant="default">Suggested</Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground break-all mt-0.5">
              {header.key}
            </p>
          </div>
        </div>
      </Command.Item>
    );
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
              <Command.List className="flex-1 min-h-0 overflow-y-auto !max-h-none p-1">
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
