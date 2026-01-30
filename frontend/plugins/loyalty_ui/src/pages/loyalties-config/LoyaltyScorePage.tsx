import { PageContainer } from 'erxes-ui';
import { ScoreRecordTable } from '~/modules/loyalties/settings/score/components/LoyaltyScoreRecordTable';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';

export const LoyaltyScorePage = () => {
  return (
    <LoyaltyLayout>
      <PageContainer>
        <ScoreRecordTable />
      </PageContainer>
    </LoyaltyLayout>
  );
};
