import { CompanyCreateButton } from '@/contacts/companies/components/CompanyCreateButton';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { useTranslation } from 'react-i18next';
import {
  Can,
  createFavoriteBreadcrumb,
  PageHeader,
  SendEmailButton,
} from 'ui-modules';

export const CompaniesHeader = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const favoriteBreadcrumb = createFavoriteBreadcrumb(t('companies'));

  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton
          breadcrumb={favoriteBreadcrumb}
          icon="IconBuilding"
        />
      </PageHeader.Start>
      <PageHeader.End>
        <SendEmailButton />
        <Can action="contactsCreate">
          <CompanyCreateButton />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
