import { CellContext } from '@tanstack/react-table';
import {
  Badge,
  RecordTableInlineCell,
  Sheet,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useState, type FC } from 'react';
import { BundleRuleForm } from './BundleRuleForm';
import { IBundleRule } from './types';

export const BundleRuleNameColumnCell: FC<CellContext<IBundleRule, unknown>> = (
  props,
) => {
  const bundleRule = props.row.original;
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
          <BundleRuleForm
            bundleRule={bundleRule}
            onOpenChange={(isOpen) => setOpen(isOpen)}
          />
        </Sheet.View>
      </Sheet>
    </RecordTableInlineCell>
  );
};

export const bundleRuleNameColumn = {
  id: 'name',
  accessorKey: 'name',
  cell: BundleRuleNameColumnCell,
  size: 250,
} as const;
