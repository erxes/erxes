import { useEffect } from 'react';
import { Button, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router';
import { IconSettings } from '@tabler/icons-react';
import { SpinRecordTable } from '~/modules/loyalties/spin/components/SpinRecordTable';
import { SpinAddSheet } from '~/modules/loyalties/spin/components/SpinAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { SpinFilter } from '~/modules/loyalties/spin/components/SpinFilter';

const SpinHeaderActions = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link to="/settings/loyalty/config/spin">
        <IconSettings className="size-4" />
        Go to settings
      </Link>
    </Button>
    <SpinAddSheet />
  </div>
);

export const SpinPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<SpinHeaderActions />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PageSubHeader>
        <SpinFilter />
      </PageSubHeader>
      <SpinRecordTable />
    </div>
  );
};
