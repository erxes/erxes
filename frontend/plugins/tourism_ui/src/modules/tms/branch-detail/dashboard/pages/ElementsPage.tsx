import { IBranch } from '@/tms/types/branch';
import { PageSubHeader } from 'erxes-ui';
import { ElementFilter, ElementRecordTable } from '../elements';

export const ElementsPage = ({ branch }: { branch: IBranch }) => {
  return (
    <>
      <PageSubHeader>
        <div className="flex gap-4 justify-between items-center w-full">
          <ElementFilter />
        </div>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <ElementRecordTable branchId={branch._id} />
        </div>
      </div>
    </>
  );
};
