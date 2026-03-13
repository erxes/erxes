import { PageSubHeader } from 'erxes-ui';
import {
  CategoryRecordTable,
  CategoryCreateSheet,
  CategoryFilter,
} from '../category';

export const CategoryPages = () => {
  return (
    <>
      <PageSubHeader>
        <div className="flex gap-4 justify-between items-center w-full">
          <CategoryFilter />
          <CategoryCreateSheet />
        </div>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <CategoryRecordTable />
        </div>
      </div>
    </>
  );
};
