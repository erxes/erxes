import { useCompanyCell } from '@/contacts/hooks/useContactTableCell';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { RecordTableInlineCell } from 'erxes-ui';
import { CompanyEmails } from 'ui-modules';

export const CompanyEmailsCell = () => {
  const { cell } = useCompanyCell();
  const company = cell.row.original;
  return (
    <CompanyEmails
      primaryEmail={company.primaryEmail || ''}
      _id={company._id}
      scope={`${ContactsHotKeyScope.CompaniesPage}.${company._id}.Emails`}
      emailValidationStatus={company.emailValidationStatus}
      emails={company.emails || []}
      Trigger={RecordTableInlineCell.Trigger}
    />
  );
};
