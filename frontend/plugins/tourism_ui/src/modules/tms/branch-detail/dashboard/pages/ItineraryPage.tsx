import { IBranch } from '@/tms/types/branch';
import { PageSubHeader } from 'erxes-ui';
import { ItineraryFilter, ItineraryRecordTable } from '../itinerary';
import { useBranchLanguages } from '@/tms/hooks/useBranchLanguages';

export const ItineraryPage = ({ branch }: { branch: IBranch }) => {
  const branchLanguageProps = useBranchLanguages(branch);
  return (
    <div className="flex flex-col h-full">
      <PageSubHeader>
        <ItineraryFilter />
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3 min-h-0">
        <div className="flex flex-col h-full min-h-0">
          <ItineraryRecordTable
            branchId={branch._id}
            {...branchLanguageProps}
          />
        </div>
      </div>
    </div>
  );
};
