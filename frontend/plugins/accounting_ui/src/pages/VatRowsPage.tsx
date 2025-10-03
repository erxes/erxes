import { VatRowsTable } from '@/settings/vat/components/VatsTable';
import { EditVatRow } from '@/settings/vat/components/EditVatRow';

export const VatRowsPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <VatRowsTable />
      </div>
      <EditVatRow />
    </div>
  );
};
