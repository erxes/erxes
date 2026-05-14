import { PageContainer, PageSubHeader } from 'erxes-ui';
import { DuplicatedHeader } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedHeader';
import { DuplicatedRecordTable } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedRecordTable';
import { DuplicatedFilter } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedFilter';

export const DuplicatedPage = () => {
  return (
    <PageContainer>
      <DuplicatedHeader />
      <PageSubHeader>
        <DuplicatedFilter />
      </PageSubHeader>
      <DuplicatedRecordTable />
    </PageContainer>
  );
};
