import { useEffect } from 'react';
import { SpinRecordTable } from '~/modules/loyalties/spin/components/SpinRecordTable';
import { SpinAddSheet } from '~/modules/loyalties/spin/components/SpinAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { SpinFilter } from '~/modules/loyalties/spin/components/SpinFilter';
import { PageSubHeader } from 'erxes-ui';

export const SpinPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<SpinAddSheet />);
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
