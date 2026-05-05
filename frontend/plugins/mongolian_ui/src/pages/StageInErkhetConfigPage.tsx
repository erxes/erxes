import { StageInErkhetConfigAddSheet } from '@/erkhet-sync/settings/stage-in-erkhet-config/components/StageInErkhetConfigAddSheet';
import { StageInErkhetConfigRecordTable } from '@/erkhet-sync/settings/stage-in-erkhet-config/components/StageInErkhetConfigRecordTable';
import { useStageInErkhetConfigs } from '@/erkhet-sync/settings/stage-in-erkhet-config/hooks/useStageInErkhetConfigs';
import { Spinner } from 'erxes-ui';

export const StageInErkhetConfigAddSheetConnected = () => {
  const { addConfig, saveLoading } = useStageInErkhetConfigs();
  return <StageInErkhetConfigAddSheet onSubmit={addConfig} loading={saveLoading} />;
};

export const StageInErkhetConfig = () => {
  const { configs, loading, saveLoading, editConfig, deleteConfig, deleteManyConfigs } =
    useStageInErkhetConfigs();

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <StageInErkhetConfigRecordTable
        configs={configs}
        onEdit={editConfig}
        onDelete={deleteConfig}
        onDeleteMany={deleteManyConfigs}
        editLoading={saveLoading}
      />
    </div>
  );
};
