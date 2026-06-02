import { IDeal } from '@/deals/types/deals';
import { SalesFormFields } from './SalesFormFields';
import { StagePipelineSelector } from '@/deals/actionBar/components/StagePipelineSelector';

const MainOverview = ({ deal }: { deal: IDeal }) => {
  return (
    <div className="pb-8 pt-2 space-y-6">
      <div className="px-8 pt-4">
        <StagePipelineSelector deal={deal} />
      </div>
      <div className="space-y-4 px-8">
        <SalesFormFields deal={deal} />
      </div>
    </div>
  );
};

export default MainOverview;
