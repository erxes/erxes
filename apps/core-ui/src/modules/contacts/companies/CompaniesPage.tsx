import { IconAddressBook, IconPlus } from '@tabler/icons-react';
import { Button, PageContainer, PageSubHeader, useQueryState } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { CustomerDetail } from '../customers/CustomerDetail';
import { CompaniesFilter } from './CompaniesFilter';
import { CompaniesRecordTable } from './CompaniesRecordTable';
import { CompanyDetail } from './CompanyDetail';
import { CompanySheet } from './CompanySheet';
import { COMPANY_SHEET_PARAM } from './useCompanies';

/** Contacts › Companies: old core-ui CompaniesIndexPage. */
export const CompaniesPage = () => {
  const [, setOpenId] = useQueryState<string>(COMPANY_SHEET_PARAM);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: 'Contacts', to: '/contacts', icon: IconAddressBook },
              { label: 'Companies', to: '/contacts/companies' },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={() => setOpenId('new')}>
            <IconPlus />
            Add company
          </Button>
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader>
        <CompaniesFilter />
      </PageSubHeader>
      <CompaniesRecordTable />
      <CompanySheet />
      <CompanyDetail />
      {/* A customer opened from a company's customer list. */}
      <CustomerDetail />
    </PageContainer>
  );
};
