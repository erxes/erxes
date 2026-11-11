import { RecordTable } from 'erxes-ui';
import { messageOf } from '~/lib/api';
import { CompaniesCommandBar } from './CompaniesCommandBar';
import { useCompaniesColumns } from './companiesColumns';
import { COMPANIES_SESSION_KEY, useCompanies } from './useCompanies';

export const CompaniesRecordTable = () => {
  const { list, loading, error, hasNextPage, hasPreviousPage, handleFetchMore } = useCompanies();
  const columns = useCompaniesColumns();

  if (error) {
    return <div className="m-3 text-sm text-destructive">{messageOf(error)}</div>;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={list}
      stickyColumns={['more', 'checkbox', 'avatar', 'primaryName']}
      className="m-3"
      tableId="companies_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list.length}
        sessionKey={COMPANIES_SESSION_KEY}
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
      <CompaniesCommandBar />
    </RecordTable.Provider>
  );
};
