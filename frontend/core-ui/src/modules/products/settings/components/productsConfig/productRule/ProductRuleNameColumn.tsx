import { ProductEditorPanel } from '@/products/components/ProductEditorPanel';
import { CellContext } from '@tanstack/react-table';
import {
  RecordTableInlineCell,
  TextOverflowTooltip,
  Badge,
  Button,
} from 'erxes-ui';
import { IProductRule } from './types';
import { useState } from 'react';
import { ProductRuleForm } from './ProductRuleForm';
import { Can } from 'ui-modules';

const ProductRuleNameColumnCell = (
  props: CellContext<IProductRule, unknown>,
) => {
  const productRule = props.row.original;
  const [open, setOpen] = useState(false);

  return (
    <RecordTableInlineCell>
      <Can action="productRulesManage">
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
        name={`product-rules/${productRule._id}`}
        open={open}
        onOpenChange={setOpen}
        requiredPermission="productRulesManage"
      >
        <ProductRuleForm
          productRule={productRule}
          onOpenChange={(isOpen) => setOpen(isOpen)}
        />
      </ProductEditorPanel>
    </RecordTableInlineCell>
  );
};

export const productRuleNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: ProductRuleNameColumnCell,
  size: 250,
} as const;
