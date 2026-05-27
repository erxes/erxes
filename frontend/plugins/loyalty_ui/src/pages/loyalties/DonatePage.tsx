import { useEffect } from 'react';
import { DonateRecordTable } from '~/modules/loyalties/donates/components/DonateRecordTable';
import { DonateAddSheet } from '~/modules/loyalties/donates/components/DonateAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { DonateFilter } from '~/modules/loyalties/donates/components/DonateFilter';
import { PageSubHeader } from 'erxes-ui';

export const DonatePage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<DonateAddSheet />);
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
