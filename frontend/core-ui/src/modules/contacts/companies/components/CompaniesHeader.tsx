import {
  Can,
  PageHeader,
  createFavoriteBreadcrumb,
  SendEmailButton,
} from 'ui-modules';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { CompanyAddSheet } from './CompanyAddSheet';
import { useTranslation } from 'react-i18next';

export const CompaniesHeader = () => {
  const { t } = useTranslation('contact');
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
          <CompanyAddSheet />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
