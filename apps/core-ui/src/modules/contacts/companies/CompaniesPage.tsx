import { PageContainer, PageSubHeader } from 'erxes-ui';
import { CompaniesFilter } from './CompaniesFilter';
import { CompaniesHeader } from './CompaniesHeader';
import { CompaniesRecordTable } from './CompaniesRecordTable';

/** Contacts › Companies: old core-ui CompaniesIndexPage. */
export const CompaniesPage = () => (
  <PageContainer>
    <CompaniesHeader />
    <PageSubHeader>
      <CompaniesFilter />
    </PageSubHeader>
    <CompaniesRecordTable />
  </PageContainer>
);
