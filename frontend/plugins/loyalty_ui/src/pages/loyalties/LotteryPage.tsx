import { useEffect } from 'react';
import { LotteryRecordTable } from '~/modules/loyalties/lotteries/components/LotteryRecordTable';
import { LotteryAddSheet } from '~/modules/loyalties/lotteries/components/LotteryAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { LotteryFilter } from '~/modules/loyalties/lotteries/components/LotteryFilter';
import { PageSubHeader } from 'erxes-ui';

export const LotteryPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<LotteryAddSheet />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PageSubHeader>
        <LotteryFilter />
      </PageSubHeader>
      <LotteryRecordTable />
    </div>
  );
};
