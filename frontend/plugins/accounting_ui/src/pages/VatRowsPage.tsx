import { VatRowsTable } from '@/settings/vat/components/VatsTable';
import { EditVatRow } from '@/settings/vat/components/EditVatRow';
/** vat rows list page l bn */
export const VatRowsPage = () => {
  return (
    <>
      <div className="flex-auto p-3 overflow-hidden flex">
        <VatRowsTable />
      </div>
      <EditVatRow />
    </>
  );
};
