import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { CellContext } from '@tanstack/react-table';
import { RecordTableInlineCell, TextOverflowTooltip, Badge } from 'erxes-ui';
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
      <CoreModulePanel
        requiredPermission="productRulesManage"
        name={`products/settings/productsConfig/productRule/ProductRuleNameColumn/${productRule._id}`}
        open={open}
        onOpenChange={setOpen}
        modal
      >
        <Can action="productRulesManage">
          <CoreModulePanel.Trigger asChild>
            <Badge variant="secondary" className="cursor-pointer">
              <TextOverflowTooltip value={props.getValue() as string} />
            </Badge>
          </CoreModulePanel.Trigger>
        </Can>
        <CoreModulePanel.View className="p-0 sm:max-w-lg">
          <ProductRuleForm
            productRule={productRule}
            onOpenChange={(isOpen) => setOpen(isOpen)}
          />
        </CoreModulePanel.View>
      </CoreModulePanel>
    </RecordTableInlineCell>
  );
};

export const productRuleNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: ProductRuleNameColumnCell,
  size: 250,
} as const;
