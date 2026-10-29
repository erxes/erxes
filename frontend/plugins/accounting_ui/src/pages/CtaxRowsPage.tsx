import { CtaxRowsTable } from '@/settings/ctax/components/CtaxsTable';

export const CTaxRowsPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <CtaxRowsTable />
      </div>
    </div>
  );
};
