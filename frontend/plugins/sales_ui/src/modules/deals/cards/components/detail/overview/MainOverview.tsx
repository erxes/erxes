import { IDeal } from '@/deals/types/deals';
import { SalesFormFields } from './SalesFormFields';

const MainOverview = ({ deal }: { deal: IDeal }) => {
  return (
    <div className="pb-8 pt-2 space-y-6">
      <div className="space-y-4 px-8">
        <SalesFormFields deal={deal} />
      </div>
    </div>
  );
};

export default MainOverview;
