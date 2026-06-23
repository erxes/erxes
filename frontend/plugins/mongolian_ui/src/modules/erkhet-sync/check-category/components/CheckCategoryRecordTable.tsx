import { IconFolderOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useCheckCategory } from '../hooks/useCheckCategory';
import { checkCategoryColumns } from './CheckCategoryColumn';

export const CheckCategoryRecordTable = () => {
  const { filteredCategories, loading, toCheckCategories } = useCheckCategory();

  const data = filteredCategories ?? [];
  const hasChecked = !!toCheckCategories;
  const isEmpty = hasChecked && data.length === 0 && !loading;

  return (
    <div className="flex flex-1 overflow-hidden">
      <RecordTable.Provider
        columns={checkCategoryColumns}
        data={data}
        className="h-full w-full"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {loading && <RecordTable.RowSkeleton rows={20} />}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
        {isEmpty && (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground py-12">
            <IconFolderOff size={48} className="mb-3 opacity-40" />
            <p className="text-sm">No categories in this list</p>
          </div>
        )}
      </RecordTable.Provider>
    </div>
  );
};
