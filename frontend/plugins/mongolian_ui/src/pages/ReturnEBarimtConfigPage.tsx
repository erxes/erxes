import { ReturnEBarimtConfigTable } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/ReturnEBarimtConfigTable';
import { EditReturnEBarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/EditReturnEBarimtConfig';

export const ReturnEBarimtConfig = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <ReturnEBarimtConfigTable />
      </div>
      <EditReturnEBarimtConfig />
    </div>
  );
};
