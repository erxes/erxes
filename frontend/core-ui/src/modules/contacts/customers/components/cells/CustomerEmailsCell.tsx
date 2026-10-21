import { useCustomerCell } from '@/contacts/hooks/useContactTableCell';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { RecordTableInlineCell } from 'erxes-ui';
import { CustomerEmails } from 'ui-modules';

export const CustomerEmailsCell = () => {
  const { cell } = useCustomerCell();
  const customer = cell.row.original;
  return (
    <CustomerEmails
      primaryEmail={customer.primaryEmail || ''}
      _id={customer._id}
      emailValidationStatus={customer.emailValidationStatus}
      emails={customer.emails || []}
      scope={ContactsHotKeyScope.CustomersTableInlinePopover}
      Trigger={RecordTableInlineCell.Trigger}
    />
  );
};
