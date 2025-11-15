import { AUTOMATION_EDIT } from '@/automations/graphql/automationMutations';
import { TAutomationRecordTableColumnDefData } from '@/automations/types';
import { useMutation } from '@apollo/client';
import { Cell } from '@tanstack/table-core';
import {
  Badge,
  cn,
  Label,
  Popover,
  RecordTableInlineCell,
  Spinner,
  Switch,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
export const AutomationRecordTableStatusInlineCell = ({
  cell,
}: {
  cell: Cell<TAutomationRecordTableColumnDefData, any>;
}) => {
  const [open, setOpen] = useState(false);
  const status =
    cell.getValue() as TAutomationRecordTableColumnDefData['status'];
  const [edit, { loading }] = useMutation(AUTOMATION_EDIT);
  const onSave = (isChecked: boolean) => {
    edit({
      variables: {
        id: cell.row.original._id,
        status: isChecked ? 'active' : 'draft',
      },
      onCompleted: () => {
        setOpen(false);
        toast({
          title: 'Success',
          description: 'Automation status updated successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        <div className="w-full flex justify-center">
          <Badge
            variant={status === 'active' ? 'success' : 'secondary'}
            className={cn('font-bold', {
              'text-accent-foreground': status !== 'active',
            })}
          >
            {status}
            {loading && <Spinner />}
          </Badge>
        </div>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-24 h-12 flex justify-center items-center space-x-2">
        <Label htmlFor="mode">Inactive</Label>
        <Switch
          id="mode"
          disabled={loading}
          onCheckedChange={(isChecked) => onSave(isChecked)}
          checked={status === 'active'}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};
