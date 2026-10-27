import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { CellContext } from '@tanstack/react-table';
import { Badge, RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
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
      <CoreModulePanel
        requiredPermission="bundleRulesManage"
        name={`products/settings/productsConfig/bundleRule/BundleRuleNameColumn/${bundleRule._id}`}
        open={open}
        onOpenChange={setOpen}
        modal
      >
        <Can action="bundleRulesManage">
          <CoreModulePanel.Trigger asChild>
            <Badge variant="secondary" className="cursor-pointer">
              <TextOverflowTooltip value={props.getValue() as string} />
            </Badge>
          </CoreModulePanel.Trigger>
        </Can>
        <CoreModulePanel.View className="p-0 sm:max-w-lg">
          <BundleRuleForm
            bundleRule={bundleRule}
            onOpenChange={(isOpen) => setOpen(isOpen)}
          />
        </CoreModulePanel.View>
      </CoreModulePanel>
    </RecordTableInlineCell>
  );
};

export const bundleRuleNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: BundleRuleNameColumnCell,
  size: 250,
} as const;
