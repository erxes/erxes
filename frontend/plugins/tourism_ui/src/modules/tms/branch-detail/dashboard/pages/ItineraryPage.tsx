import { IBranch } from '@/tms/types/branch';
import { PageSubHeader } from 'erxes-ui';
import { ItineraryFilter, ItineraryRecordTable } from '../itinerary';

export const ItineraryPage = ({ branch }: { branch: IBranch }) => {
  return (
    <>
      <PageSubHeader>
        <ItineraryFilter />
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <ItineraryRecordTable branchId={branch._id} />
        </div>
      </div>
    </>
  );
};
