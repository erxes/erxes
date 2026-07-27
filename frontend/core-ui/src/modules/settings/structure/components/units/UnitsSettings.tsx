import { RecordTable } from 'erxes-ui';
import { useUnitsList } from '../../hooks/useUnitsList';
import { getUnitsColumns } from './UnitsColumns';
import { useTranslation } from 'react-i18next';
import { UnitEdit } from './detail/UnitEdit';
import { UnitsFilter } from './UnitsFilter';
import { UnitsCommandBar } from './UnitsCommandBar';

export function UnitsSettings() {
  const { t } = useTranslation('settings');
  const { units, loading } = useUnitsList();
  return (
    <div className="w-full overflow-hidden flex flex-col">
      <UnitEdit />
      <UnitsFilter />
      <RecordTable.Provider
        data={units || []}
        columns={getUnitsColumns(t)}
        stickyColumns={['more', 'checkbox', 'code', 'title']}
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
