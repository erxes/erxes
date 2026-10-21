import { useCustomerCell } from '@/contacts/hooks/useContactTableCell';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import type { SexCode } from 'erxes-ui';
import {
  PopoverScoped,
  RecordTableInlineCell,
  SexDisplay,
  SexField,
} from 'erxes-ui';
import { useState } from 'react';
import { useCustomerEdit } from 'ui-modules';

export const CustomerSexCell = () => {
  const { cell } = useCustomerCell();
  const { customerEdit } = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const { _id } = cell.row.original;
  return (
    <PopoverScoped
      scope={ContactsHotKeyScope.CustomersTableInlinePopover}
      open={open}
      onOpenChange={setOpen}
    >
      <RecordTableInlineCell.Trigger>
        <SexDisplay value={cell.getValue() as SexCode} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <SexField
          value={cell.getValue() as SexCode}
          onValueChange={(value) => {
            if (value !== (cell.getValue() as SexCode)) {
              customerEdit({
                variables: { _id, sex: value },
              });
            }
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
