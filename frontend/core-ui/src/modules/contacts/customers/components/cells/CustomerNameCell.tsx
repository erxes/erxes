import { useCustomerCell } from '@/contacts/hooks/useContactTableCell';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import clsx from 'clsx';
import { FullNameValue, RecordTableInlineCell } from 'erxes-ui';
import { CustomerName, useSidePanel } from 'ui-modules';

export const CustomerNameCell = () => {
  const { cell } = useCustomerCell();
  const { openRecord } = useSidePanel();

  const {
    firstName = '',
    lastName = '',
    _id,
    middleName = '',
  } = cell.row.original;

  return (
    <CustomerName
      _id={_id}
      firstName={firstName}
      lastName={`${middleName || ''}${middleName ? ' ' : ''}${lastName || ''}`}
      scope={clsx(ContactsHotKeyScope.CustomersPage, _id, 'Name')}
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor
          onClick={() =>
            openRecord({ contentType: 'core:customer', contentId: _id })
          }
        >
          <FullNameValue />
        </RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
    </CustomerName>
  );
};
