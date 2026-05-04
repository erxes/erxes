import { PosInEBarimtConfigTable } from '@/ebarimt/settings/pos-in-ebarimt-config/components/PosInEBarimtConfigTable';
import { EditPosInEBarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/components/EditPosInEBarimtConfig';

export const PosInEBarimtConfig = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <PosInEBarimtConfigTable />
      </div>
      <EditPosInEBarimtConfig />
    </div>
  );
};
