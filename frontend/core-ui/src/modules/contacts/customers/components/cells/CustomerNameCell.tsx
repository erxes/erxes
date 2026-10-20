import { useCustomerCell } from '@/contacts/hooks/useContactTableCell';
import { renderingCustomerDetailAtom } from '@/contacts/states/customerDetailStates';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import clsx from 'clsx';
import { FullNameValue, RecordTableInlineCell, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { CustomerName } from 'ui-modules';

export const CustomerNameCell = () => {
  const { cell } = useCustomerCell();
  const [, setDetailOpen] = useQueryState('contactId');
  const setRenderingCustomerDetail = useSetAtom(renderingCustomerDetailAtom);

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
          onClick={() => {
            setDetailOpen(_id);
            setRenderingCustomerDetail(false);
          }}
        >
          <FullNameValue />
        </RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
    </CustomerName>
  );
};
