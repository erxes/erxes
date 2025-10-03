import { PageHeader } from 'ui-modules';
import { CustomerAddSheet } from './CustomerAddSheet';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';

export const CustomersHeader = () => {
  const { isLead } = useIsCustomerLeadSessionKey();

  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>{!isLead && <CustomerAddSheet />}</PageHeader.End>
    </PageHeader>
  );
};
