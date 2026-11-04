import { PageSubHeader } from 'erxes-ui';
import { CategoryRecordTable, CategoryFilter } from '../category';
import { IBranch } from '@/tms/types/branch';
import { useBranchLanguages } from '@/tms/hooks/useBranchLanguages';

interface CategoryPageProps {
  branch: IBranch;
}

export const CategoryPage = ({ branch }: CategoryPageProps) => {
  const branchLanguageProps = useBranchLanguages(branch);
  return (
    <div className="flex flex-col h-full">
      <PageSubHeader>
        <div className="flex gap-4 justify-between items-center w-full">
          <CategoryFilter />
        </div>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3 min-h-0">
        <div className="flex flex-col h-full min-h-0">
          <CategoryRecordTable branchId={branch._id} {...branchLanguageProps} />
        </div>
      </div>
    </div>
  );
};
