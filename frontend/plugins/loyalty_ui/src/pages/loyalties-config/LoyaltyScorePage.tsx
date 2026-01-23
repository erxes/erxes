import { PageContainer } from 'erxes-ui';
import { LoyaltyScoreRecordTable } from '~/modules/loyalties/settings/score/components/LoyaltyScoreRecordTable';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';

export const LoyaltyScorePage = () => {
  return (
    <LoyaltyLayout>
      <PageContainer>
        <LoyaltyScoreRecordTable />
      </PageContainer>
    </LoyaltyLayout>
  );
};
