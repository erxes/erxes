import DealViewControl from '@/deals/actionBar/components/DealViewControl';
import { SalesFilter } from '@/deals/actionBar/components/SalesFilter';

import ArchivedDeals from '@/deals/actionBar/components/ArchivedDeals';

const MainActionBar = () => {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <SalesFilter />
      <div className="flex items-center gap-2">
        <ArchivedDeals />
        <DealViewControl />
      </div>
    </div>
  );
};

export default MainActionBar;
