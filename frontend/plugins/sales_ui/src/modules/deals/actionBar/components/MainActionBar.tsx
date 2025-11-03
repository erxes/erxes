import DealViewControl from '@/deals/actionBar/components/DealViewControl';
import { SalesFilter } from '@/deals/actionBar/components/SalesFilter';

const MainActionBar = () => {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <SalesFilter />
      <DealViewControl />
    </div>
  );
};

export default MainActionBar;
