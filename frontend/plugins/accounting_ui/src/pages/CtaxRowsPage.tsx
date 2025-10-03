import { CtaxRowsTable } from '@/settings/ctax/components/CtaxsTable';
import { EditCtaxRow } from '@/settings/ctax/components/EditCtaxRow';

export const CTaxRowsPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <CtaxRowsTable />
      </div>
      <EditCtaxRow />
    </div>
  );
};
