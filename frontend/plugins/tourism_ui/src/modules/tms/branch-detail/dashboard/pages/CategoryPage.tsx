import { PageSubHeader } from 'erxes-ui';
import { CategoryRecordTable, CategoryFilter } from '../category';

export const CategoryPage = () => {
  return (
    <div className="flex flex-col h-full">
      <PageSubHeader>
        <div className="flex gap-4 justify-between items-center w-full">
          <CategoryFilter />
        </div>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3 min-h-0">
        <div className="flex flex-col h-full min-h-0">
          <CategoryRecordTable />
        </div>
      </div>
    </div>
  );
};
