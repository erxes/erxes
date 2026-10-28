import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { CellContext } from '@tanstack/react-table';
import { TextOverflowTooltip, Badge, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';
import { Can, IUom } from 'ui-modules';
import { UomForm } from '@/products/settings/components/uoms/UomForm';

export const UomNameColumnCell = (props: CellContext<IUom, unknown>) => {
  const uom = props.row.original;
  const [open, setOpen] = useState(false);

  return (
    <RecordTableInlineCell>
      <CoreModulePanel
        requiredPermission="uomsManage"
        name={`products/settings/uoms/UomNameColumn/${uom._id}`}
        open={open}
        onOpenChange={setOpen}
        modal
      >
        <Can action="uomsManage">
          <CoreModulePanel.Trigger asChild>
            <Badge variant="secondary" className="cursor-pointer">
              <TextOverflowTooltip value={props.getValue() as string} />
            </Badge>
          </CoreModulePanel.Trigger>
        </Can>
        <CoreModulePanel.View className="p-0 sm:max-w-lg">
          <UomForm uom={uom} onOpenChange={(isOpen) => setOpen(isOpen)} />
        </CoreModulePanel.View>
      </CoreModulePanel>
    </RecordTableInlineCell>
  );
};

export const uomNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: UomNameColumnCell,
  size: 250,
} as const;
