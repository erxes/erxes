import { ProductEditorPanel } from '@/products/components/ProductEditorPanel';
import { CellContext } from '@tanstack/react-table';
import {
  Badge,
  RecordTableInlineCell,
  TextOverflowTooltip,
  Button,
} from 'erxes-ui';
import { useState, type FC } from 'react';
import { BundleRuleForm } from './BundleRuleForm';
import { IBundleRule } from './types';
import { Can } from 'ui-modules';

export const BundleRuleNameColumnCell: FC<CellContext<IBundleRule, unknown>> = (
  props,
) => {
  const bundleRule = props.row.original;
  const [open, setOpen] = useState(false);

  return (
    <RecordTableInlineCell>
      <Can action="bundleRulesManage">
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
        name={`bundle-rules/${bundleRule._id}`}
        open={open}
        onOpenChange={setOpen}
        requiredPermission="bundleRulesManage"
      >
        <BundleRuleForm
          bundleRule={bundleRule}
          onOpenChange={(isOpen) => setOpen(isOpen)}
        />
      </ProductEditorPanel>
    </RecordTableInlineCell>
  );
};

export const bundleRuleNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: BundleRuleNameColumnCell,
  size: 250,
} as const;
