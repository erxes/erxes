import { ProductEditorPanel } from '@/products/components/ProductEditorPanel';
import { CellContext } from '@tanstack/react-table';
import {
  Badge,
  RecordTableInlineCell,
  TextOverflowTooltip,
  Button,
} from 'erxes-ui';
import { useState } from 'react';
import { BundleConditionForm } from './BundleConditionForm';
import { IBundleCondition } from './types';
import { Can } from 'ui-modules';

export const BundleConditionNameColumnCell = (
  props: CellContext<IBundleCondition, unknown>,
) => {
  const bundleCondition = props.row.original;
  const [open, setOpen] = useState(false);

  return (
    <RecordTableInlineCell>
      <Can action="bundleConditionsManage">
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
        name={`bundle-conditions/${bundleCondition._id}`}
        open={open}
        onOpenChange={setOpen}
        requiredPermission="bundleConditionsManage"
      >
        <BundleConditionForm
          bundleCondition={bundleCondition}
          onOpenChange={(isOpen) => setOpen(isOpen)}
        />
      </ProductEditorPanel>
    </RecordTableInlineCell>
  );
};

export const bundleConditionNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: BundleConditionNameColumnCell,
  size: 250,
} as const;
