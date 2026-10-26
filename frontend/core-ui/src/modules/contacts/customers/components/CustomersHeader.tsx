import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { CustomerCreateButton } from '@/contacts/customers/components/CustomerCreateButton';
import { useIsCustomerLeadSessionKey } from '@/contacts/customers/hooks/useCustomerLeadSessionKey';
import { useTranslation } from 'react-i18next';
import {
  Can,
  createFavoriteBreadcrumb,
  PageHeader,
  SendEmailButton,
} from 'ui-modules';

export const CustomersHeader = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
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
        <SendEmailButton />
        <Can action="contactsCreate">
          <CustomerCreateButton />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
