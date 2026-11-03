import { useCompanyCell } from '@/contacts/hooks/useContactTableCell';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import clsx from 'clsx';
import { RecordTableInlineCell } from 'erxes-ui';
import { CompanyName, getCompanyDisplayName, useSidePanel } from 'ui-modules';

export const CompanyNameCell = () => {
  const { cell } = useCompanyCell();
  const { primaryName, _id } = cell.row.original;
  const { openRecord } = useSidePanel();
  return (
    <CompanyName
      primaryName={primaryName}
      _id={_id}
      scope={clsx(ContactsHotKeyScope.CompaniesPage, _id, 'Name')}
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor
          onClick={() =>
            openRecord({ contentType: 'core:company', contentId: _id })
          }
        >
          {primaryName || getCompanyDisplayName(cell.row.original)}
        </RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
    </CompanyName>
  );
};
