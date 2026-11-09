import { ProductEditorPanel } from '@/products/components/ProductEditorPanel';
import type { CellContext } from '@tanstack/react-table';
import {
  Badge,
  Button,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useState } from 'react';
import { Can } from 'ui-modules';
import { ConditionForm } from './ConditionForm';
import type { IProductCondition } from './types';

export const ConditionNameColumn = ({
  row,
}: CellContext<IProductCondition, unknown>) => {
  const [open, setOpen] = useState(false);
  return (
    <RecordTableInlineCell>
      <Can action="productsConfigsManage">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto p-0"
          onClick={() => setOpen(true)}
        >
          <Badge variant="secondary">
            <TextOverflowTooltip value={row.original.name} />
          </Badge>
        </Button>
      </Can>
      <ProductEditorPanel
        name={`conditions/${row.original._id}`}
        open={open}
        onOpenChange={setOpen}
        requiredPermission="productsConfigsManage"
      >
        <ConditionForm condition={row.original} onDone={() => setOpen(false)} />
      </ProductEditorPanel>
    </RecordTableInlineCell>
  );
};
