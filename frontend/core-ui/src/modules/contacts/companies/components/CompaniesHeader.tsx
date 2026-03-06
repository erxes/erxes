import { PageHeader } from 'ui-modules';
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
        <CompanyAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
