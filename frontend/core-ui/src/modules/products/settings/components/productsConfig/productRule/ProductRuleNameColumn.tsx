import { CellContext } from '@tanstack/react-table';
import {
  RecordTableInlineCell,
  TextOverflowTooltip,
  Badge,
  Sheet,
} from 'erxes-ui';
import { IProductRule } from './types';
import { useState } from 'react';
import { ProductRuleForm } from './ProductRuleForm';

const ProductRuleNameColumnCell = (
  props: CellContext<IProductRule, unknown>,
) => {
  const productRule = props.row.original;
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
          <ProductRuleForm
            productRule={productRule}
            onOpenChange={(isOpen) => setOpen(isOpen)}
          />
        </Sheet.View>
      </Sheet>
    </RecordTableInlineCell>
  );
};

export const productRuleNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: ProductRuleNameColumnCell,
  size: 250,
} as const;
