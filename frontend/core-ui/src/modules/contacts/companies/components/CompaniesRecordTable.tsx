import { RecordTable } from 'erxes-ui';
import { useCompanies } from '@/contacts/companies/hooks/useCompanies';
import { CompaniesCommandBar } from '@/contacts/companies/components/companies-command-bar';
import { companyColumns } from '@/contacts/companies/components/CompanyColumns';

export const CompaniesRecordTable = () => {
  const { companies, handleFetchMore, loading, pageInfo } = useCompanies();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={companyColumns}
      data={companies || [{}]}
      stickyColumns={['more', 'checkbox', 'avatar', 'primaryName']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={companies?.length}
        sessionKey="companies_cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}

            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <CompaniesCommandBar />
    </RecordTable.Provider>
  );
};
