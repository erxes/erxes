import { VatRowsTable } from '@/settings/vat/components/VatsTable';
import { EditVatRow } from '@/settings/vat/components/EditVatRow';
import { Can, Import } from 'ui-modules';

export const VatRowsPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-end p-3 pb-0">
        <Can action="vatRowsImportManage">
          <Import
            pluginName="accounting"
            moduleName="account"
            collectionName="vatRows"
          />
        </Can>
      </div>
      <div className="flex-auto p-3 overflow-hidden flex">
        <VatRowsTable />
      </div>
      <EditVatRow />
    </div>
  );
};
