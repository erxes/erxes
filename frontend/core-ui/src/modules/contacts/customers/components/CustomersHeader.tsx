import { Can, PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { CustomerAddSheet } from './CustomerAddSheet';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { useIsCustomerLeadSessionKey } from '@/contacts/customers/hooks/useCustomerLeadSessionKey';
import { useTranslation } from 'react-i18next';

export const CustomersHeader = () => {
  const { t } = useTranslation('contact');
  const { isLead } = useIsCustomerLeadSessionKey();
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    isLead ? t('leads') : t('customers'),
  );

  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton
          breadcrumb={favoriteBreadcrumb}
          icon={isLead ? 'IconMagnet' : 'IconUser'}
        />
      </PageHeader.Start>

      <PageHeader.End>
        <Can action="contactsCreate">
          <CustomerAddSheet />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
