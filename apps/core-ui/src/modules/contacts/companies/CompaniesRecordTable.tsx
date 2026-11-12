import { RecordTable } from 'erxes-ui';
import { messageOf } from '~/lib/api';
import { CompaniesCommandBar } from './CompaniesCommandBar';
import { stickyWithStage } from '~/modules/leads/leadColumns';
import { useCompaniesColumns } from './companiesColumns';
import { EmptyList } from '../components/EmptyList';
import { COMPANIES_SESSION_KEY, useCompanies } from './useCompanies';

export const CompaniesRecordTable = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const { list, loading, error, hasNextPage, hasPreviousPage, handleFetchMore } =
    useCompanies(state);
  const columns = useCompaniesColumns(state);

  if (error) {
    return <div className="m-3 text-sm text-destructive">{messageOf(error)}</div>;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={list}
      stickyColumns={stickyWithStage(
        ['more', 'checkbox', 'avatar', 'primaryName'],
        state === 'lead',
      )}
      className="m-3"
      tableId={state === 'lead' ? 'company_leads_record_table' : 'companies_record_table'}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list.length}
        sessionKey={state === 'lead' ? 'core_company_leads_cursor' : COMPANIES_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
            {loading ? <RecordTable.RowSkeleton rows={32} /> : <RecordTable.RowList />}
            <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      {!loading && !list.length && <EmptyList />}
      <CompaniesCommandBar />
    </RecordTable.Provider>
  );
};
