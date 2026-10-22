import { useCompanyCell } from '@/contacts/hooks/useContactTableCell';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import clsx from 'clsx';
import { SelectMember, useCompaniesEdit } from 'ui-modules';

export const CompanyOwnerCell = () => {
  const { cell } = useCompanyCell();
  const { companiesEdit } = useCompaniesEdit();
  return (
    <SelectMember.InlineCell
      scope={clsx(
        ContactsHotKeyScope.CompaniesPage,
        cell.row.original._id,
        'Owner',
      )}
      value={cell.getValue() as string}
      onValueChange={(value) =>
        companiesEdit({
          variables: {
            _id: cell.row.original._id,
            ownerId: value as string,
          },
        })
      }
    />
  );
};
