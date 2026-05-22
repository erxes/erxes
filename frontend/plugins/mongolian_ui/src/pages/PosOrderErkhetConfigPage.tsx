import { StageInErkhetConfigAddSheet } from '@/erkhet-sync/settings/stage-in-erkhet-config/components/StageInErkhetConfigAddSheet';
import { useStageInErkhetConfigs } from '@/erkhet-sync/settings/stage-in-erkhet-config/hooks/useStageInErkhetConfigs';
import { Spinner } from 'erxes-ui';
import { PosOrderErkhetConfigRecordTable } from '~/modules/erkhet-sync/settings/pos-order-erkhet-config/components/PosOrderErkhetConfig';
import { TPosOrderErkhetConfig, usePosOrderErkhetConfigs } from '~/modules/erkhet-sync/settings/pos-order-erkhet-config/hooks/usePosOrderErkhetConfigs';

export const StageInErkhetConfigAddSheetConnected = () => {
  const { addConfig, saveLoading } = useStageInErkhetConfigs();
  return <StageInErkhetConfigAddSheet onSubmit={addConfig} loading={saveLoading} />;
};

export const PosOrderErkhetConfig = () => {
   const {
      configs,
      deleteConfig,
      deleteManyConfigs,
      loading,
      poss,
      saveConfig,
      saveLoading,
    } = usePosOrderErkhetConfigs();
  
    const editConfig = async (id: string, data: TPosOrderErkhetConfig) => {
      await saveConfig({ ...data, _id: id });
    };
  
    if (loading) {
      return <Spinner />;
    }
  
    return (
      <div className="flex flex-col flex-auto overflow-hidden">
        <PosOrderErkhetConfigRecordTable
          configs={configs}
          editLoading={saveLoading}
          onDelete={deleteConfig}
          onDeleteMany={deleteManyConfigs}
          onEdit={editConfig}
          poss={poss}
        />
      </div>
    );
};
