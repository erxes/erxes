import { CompaniesHeader } from '@/contacts/companies/components/CompaniesHeader';
import { CompaniesRecordTable } from '@/contacts/companies/components/CompaniesRecordTable';
import { CompaniesFilter } from '@/contacts/companies/components/CompaniesFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { CompanyDetail } from '@/contacts/companies/company-detail/CompanyDetail';

export const CompaniesIndexPage = () => {
  return (
    <PageContainer>
      <CompaniesHeader />
      <PageSubHeader>
        <CompaniesFilter />
      </PageSubHeader>
      <CompaniesRecordTable />
      <CompanyDetail />
    </PageContainer>
  );
};
