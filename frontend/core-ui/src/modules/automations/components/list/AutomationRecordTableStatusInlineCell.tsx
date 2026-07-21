import { AUTOMATION_EDIT } from '@/automations/graphql/automationMutations';
import {
  AutomationsHotKeyScope,
  TAutomationRecordTableColumnDefData,
} from '@/automations/types';
import { useMutation } from '@apollo/client';
import { Cell } from '@tanstack/table-core';
import {
  Badge,
  cn,
  Label,
  PopoverScoped,
  RecordTableInlineCell,
  Spinner,
  Switch,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
export const AutomationRecordTableStatusInlineCell = ({
  cell,
}: {
  cell: Cell<TAutomationRecordTableColumnDefData, any>;
}) => {
  const { t } = useTranslation('automations');
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
          title: t('success', 'Success'),
          description: t('automation-status-updated', 'Automation status updated successfully'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return (
    <PopoverScoped
      scope={AutomationsHotKeyScope.AutomationsTableInlinePopover}
      open={open}
      onOpenChange={setOpen}
    >
      <RecordTableInlineCell.Trigger>
        <div className="w-full flex">
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
      <RecordTableInlineCell.Content className="h-cell ">
        <div className="w-full flex h-full py-1 px-2 gap-2">
          <Badge
            variant={status === 'active' ? 'success' : 'secondary'}
            className={cn('font-bold', {
              'text-accent-foreground': status !== 'active',
            })}
          >
            {status}
          </Badge>
          <Switch
            id="mode"
            disabled={loading}
            onCheckedChange={(isChecked) => onSave(isChecked)}
            checked={status === 'active'}
          />
        </div>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
