import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { CellContext } from '@tanstack/react-table';
import { Badge, RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
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
      <CoreModulePanel
        requiredPermission="bundleConditionsManage"
        name={`products/settings/productsConfig/bundleCondition/BundleConditionNameColumn/${bundleCondition._id}`}
        open={open}
        onOpenChange={setOpen}
        modal
      >
        <Can action="bundleConditionsManage">
          <CoreModulePanel.Trigger asChild>
            <Badge variant="secondary" className="cursor-pointer">
              <TextOverflowTooltip value={props.getValue() as string} />
            </Badge>
          </CoreModulePanel.Trigger>
        </Can>
        <CoreModulePanel.View className="p-0 sm:max-w-lg">
          <BundleConditionForm
            bundleCondition={bundleCondition}
            onOpenChange={(isOpen) => setOpen(isOpen)}
          />
        </CoreModulePanel.View>
      </CoreModulePanel>
    </RecordTableInlineCell>
  );
};

export const bundleConditionNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: BundleConditionNameColumnCell,
  size: 250,
} as const;
