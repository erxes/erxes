import { StageInEBarimtConfigTable } from '@/ebarimt/settings/stage-in-ebarimt-config/components/StageInEBarimtConfigTable';
import { EditStageInEBarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/components/EditStageInEBarimtConfig';

export const StageInEBarimtConfig = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <StageInEBarimtConfigTable />
      </div>
      <EditStageInEBarimtConfig />
    </div>
  );
};
