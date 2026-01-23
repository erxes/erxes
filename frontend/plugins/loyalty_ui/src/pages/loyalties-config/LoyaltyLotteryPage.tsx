import { PageContainer } from 'erxes-ui';
import { useQueryState } from 'erxes-ui';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';
import { LoyaltyLotteryEditSheet } from '~/modules/loyalties/settings/lottery/lottery-detail/components/LoyaltyLotteryEditSheet';
import { LotteryRecordTable } from '~/modules/loyalties/settings/lottery/components/LotteryRecordTable';
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
