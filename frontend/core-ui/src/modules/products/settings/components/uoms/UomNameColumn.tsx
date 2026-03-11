import { CellContext } from '@tanstack/react-table';
import {
  TextOverflowTooltip,
  Badge,
  RecordTableInlineCell,
  Sheet,
} from 'erxes-ui';
import { useState } from 'react';
import { IUom } from 'ui-modules';
import { UomForm } from './UomForm';

export const UomNameColumnCell = (props: CellContext<IUom, unknown>) => {
  const uom = props.row.original;
  const [open, setOpen] = useState(false);

  return (
    <RecordTableInlineCell>
      <Sheet open={open} onOpenChange={setOpen} modal>
        <Sheet.Trigger asChild>
          <Badge variant="secondary" className="cursor-pointer">
            <TextOverflowTooltip value={props.getValue() as string} />
          </Badge>
        </Sheet.Trigger>
        <Sheet.View className="p-0 sm:max-w-lg">
          <UomForm uom={uom} onOpenChange={(isOpen) => setOpen(isOpen)} />
        </Sheet.View>
      </Sheet>
    </RecordTableInlineCell>
  );
};

export const uomNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: UomNameColumnCell,
  size: 250,
} as const;
