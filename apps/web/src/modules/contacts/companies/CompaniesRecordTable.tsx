import { CursorRecordTable } from '~/components/CursorRecordTable';
import { stickyWithStage } from '~/modules/leads/leadColumns';
import { CompaniesCommandBar } from './CompaniesCommandBar';
import { useCompaniesColumns } from './companiesColumns';
import { useCompanies } from './useCompanies';

export const CompaniesRecordTable = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const cursor = useCompanies(state);

  return (
    <CursorRecordTable
      cursor={cursor}
      columns={useCompaniesColumns(state)}
      stickyColumns={stickyWithStage(
        ['more', 'checkbox', 'avatar', 'primaryName'],
        state === 'lead',
      )}
      tableId={state === 'lead' ? 'company_leads_record_table' : 'companies_record_table'}
    >
      <CompaniesCommandBar rows={cursor.list} />
    </CursorRecordTable>
  );
};
