import { useEffect } from 'react';
import { Button, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router';
import { IconSettings } from '@tabler/icons-react';
import { LotteryRecordTable } from '~/modules/loyalties/lotteries/components/LotteryRecordTable';
import { LotteryAddSheet } from '~/modules/loyalties/lotteries/components/LotteryAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { LotteryFilter } from '~/modules/loyalties/lotteries/components/LotteryFilter';

const LotteryHeaderActions = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link to="/settings/loyalty/config/lottery">
        <IconSettings className="size-4" />
        Go to settings
      </Link>
    </Button>
    <LotteryAddSheet />
  </div>
);

export const LotteryPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<LotteryHeaderActions />);
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
