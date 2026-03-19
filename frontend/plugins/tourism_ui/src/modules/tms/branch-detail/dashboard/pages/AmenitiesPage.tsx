import { IBranch } from '@/tms/types/branch';
import { PageSubHeader } from 'erxes-ui';
import { AmenityFilter, AmenityRecordTable } from '../amenities';

export const AmenitiesPage = ({ branch }: { branch: IBranch }) => {
  return (
    <>
      <PageSubHeader>
        <div className="flex gap-4 justify-between items-center w-full">
          <AmenityFilter />
        </div>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <AmenityRecordTable branchId={branch._id} />
        </div>
      </div>
    </>
  );
};
