import { CompaniesHeader } from '@/contacts/companies/components/CompaniesHeader';
import { CompaniesRecordTable } from '@/contacts/companies/components/CompaniesRecordTable';
import { CompaniesFilter } from '@/contacts/companies/components/CompaniesFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { CompanyDetail } from '@/contacts/companies/company-detail/CompanyDetail';
import { useCompanies } from '@/contacts/companies/hooks/useCompanies';
import { Export, Import } from 'ui-modules';

export const CompaniesIndexPage = () => {

  const {companiesQueryVariables}  = useCompanies();

  const getFilters = () => {
    const { limit, ...filters } = companiesQueryVariables;
    return filters;
  };

  return (
    <PageContainer>
      <CompaniesHeader />
      <PageSubHeader>
        <CompaniesFilter />
        <Import
          pluginName='core'
          moduleName='contact'
          collectionName='company'
        />
        <Export
          pluginName='core'
          moduleName='contact'
          collectionName='company'
          getFilters={getFilters}
        />
      </PageSubHeader>
      <CompaniesRecordTable />
      <CompanyDetail />
    </PageContainer>
  );
};
