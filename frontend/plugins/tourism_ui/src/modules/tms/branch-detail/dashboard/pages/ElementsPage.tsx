import { IBranch } from '@/tms/types/branch';
import { PageSubHeader } from 'erxes-ui';
import { ElementFilter, ElementRecordTable } from '../elements';

export const ElementsPage = ({ branch }: { branch: IBranch }) => {
  return (
    <div className="flex flex-col h-full">
      <PageSubHeader>
        <div className="flex gap-4 justify-between items-center w-full">
          <ElementFilter />
        </div>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3 min-h-0">
        <div className="flex flex-col h-full min-h-0">
          <ElementRecordTable
            branchId={branch._id}
            branchLanguages={branch.languages}
            mainLanguage={branch.language}
          />
        </div>
      </div>
    </div>
  );
};
