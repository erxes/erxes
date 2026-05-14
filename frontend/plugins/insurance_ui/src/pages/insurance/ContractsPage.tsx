import { ContractsHeader } from '~/modules/insurance/components/contracts/ContractsHeader';
import { ContractsFilter } from '~/modules/insurance/components/contracts/ContractsFilter';
import { ContractsRecordTable } from '~/modules/insurance/components/contracts/ContractsRecordTable';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ContractsPage = () => {
  return (
    <PageContainer>
      <ContractsHeader />
      <PageSubHeader>
        <ContractsFilter />
      </PageSubHeader>
      <ContractsRecordTable />
    </PageContainer>
  );
};
