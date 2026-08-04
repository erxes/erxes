import { PageContainer, useQueryState } from 'erxes-ui';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';
import { LotteryRecordTable } from '~/modules/loyalties/settings/lottery/components/LotteryRecordTable';
import { LoyaltyLotteryEditSheet } from '~/modules/loyalties/settings/lottery/lottery-detail/components/LoyaltyLotteryEditSheet';

export const LoyaltyLotteryPage = () => {
  const [editLotteryId] = useQueryState<string>('editLotteryId');

  return (
    <LoyaltyLayout>
      <PageContainer>
        <LotteryRecordTable />
        {editLotteryId && <LoyaltyLotteryEditSheet lotteryId={editLotteryId} />}
      </PageContainer>
    </LoyaltyLayout>
  );
};
