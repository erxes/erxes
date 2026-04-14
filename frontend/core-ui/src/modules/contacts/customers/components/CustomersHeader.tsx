import { Can, PageHeader } from 'ui-modules';
import { CustomerAddSheet } from './CustomerAddSheet';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';

export const CustomersHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>
        <Can action="contactsCreate">
          <CustomerAddSheet />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
