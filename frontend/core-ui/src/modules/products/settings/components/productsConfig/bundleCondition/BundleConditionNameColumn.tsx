import { CellContext } from '@tanstack/react-table';
import {
  Badge,
  RecordTableInlineCell,
  Sheet,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useState } from 'react';
import { BundleConditionForm } from './BundleConditionForm';
import { IBundleCondition } from './types';

export const BundleConditionNameColumnCell = (
  props: CellContext<IBundleCondition, unknown>
) => {
  const bundleCondition = props.row.original;
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
          <BundleConditionForm
            bundleCondition={bundleCondition}
            onOpenChange={(isOpen) => setOpen(isOpen)}
          />
        </Sheet.View>
      </Sheet>
    </RecordTableInlineCell>
  );
};

export const bundleConditionNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: BundleConditionNameColumnCell,
  size: 250,
} as const;
