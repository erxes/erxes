import { PageHeader } from 'ui-modules';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';

export const CompaniesHeader = () => {
  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <ContactsBreadcrumb />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
      </PageHeader>
    </>
  );
};
