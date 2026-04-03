import { Can, PageHeader } from 'ui-modules';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { CompanyAddSheet } from './CompanyAddSheet';

export const CompaniesHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      <PageHeader.End>
        <Can action="contactsCreate">
          <CompanyAddSheet />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
