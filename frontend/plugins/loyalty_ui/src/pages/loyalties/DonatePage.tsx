import { useEffect } from 'react';
import { Button, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router';
import { IconSettings } from '@tabler/icons-react';
import { DonateRecordTable } from '~/modules/loyalties/donates/components/DonateRecordTable';
import { DonateAddSheet } from '~/modules/loyalties/donates/components/DonateAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { DonateFilter } from '~/modules/loyalties/donates/components/DonateFilter';

const DonateHeaderActions = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link to="/settings/loyalty/config/donate">
        <IconSettings className="size-4" />
        Go to settings
      </Link>
    </Button>
    <DonateAddSheet />
  </div>
);

export const DonatePage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<DonateHeaderActions />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PageSubHeader>
        <DonateFilter />
      </PageSubHeader>
      <DonateRecordTable />
    </div>
  );
};
