import { ProductEditorPanel } from '@/products/components/ProductEditorPanel';
import { CellContext } from '@tanstack/react-table';
import {
  TextOverflowTooltip,
  Badge,
  RecordTableInlineCell,
  Button,
} from 'erxes-ui';
import { useState } from 'react';
import { Can, IUom } from 'ui-modules';
import { UomForm } from './UomForm';

export const UomNameColumnCell = (props: CellContext<IUom, unknown>) => {
  const uom = props.row.original;
  const [open, setOpen] = useState(false);

  return (
    <RecordTableInlineCell>
      <Can action="uomsManage">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto p-0"
          onClick={() => setOpen(true)}
        >
          <Badge variant="secondary" className="cursor-pointer">
            <TextOverflowTooltip value={props.getValue() as string} />
          </Badge>
        </Button>
      </Can>
      <ProductEditorPanel
        name={`uoms/${uom._id}`}
        open={open}
        onOpenChange={setOpen}
        requiredPermission="uomsManage"
      >
        <UomForm uom={uom} onOpenChange={(isOpen) => setOpen(isOpen)} />
      </ProductEditorPanel>
    </RecordTableInlineCell>
  );
};

export const uomNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: UomNameColumnCell,
  size: 250,
} as const;
