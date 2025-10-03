import { RecordTable } from 'erxes-ui';
import { useUnitsList } from '../../hooks/useUnitsList';
import { UnitsColumns } from './UnitsColumns';
import { UnitEdit } from './detail/UnitEdit';
import { UnitsFilter } from './UnitsFilter';
import { UnitsCommandBar } from './UnitsCommandBar';

export function UnitsSettings() {
  const { units, loading } = useUnitsList();
  return (
    <div className="w-full overflow-hidden flex flex-col">
      <UnitEdit />
      <UnitsFilter />
      <RecordTable.Provider
        data={units || []}
        columns={UnitsColumns}
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {loading && <RecordTable.RowSkeleton rows={30} />}
            </RecordTable.Body>
            <UnitsCommandBar />
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </div>
  );
}
