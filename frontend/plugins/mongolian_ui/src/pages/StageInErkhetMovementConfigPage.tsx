import { MovementConfigAddSheet } from '@/erkhet-sync/settings/stage-in-erkhet-movement-config/components/MovementConfigAddSheet';
import { MovementConfigRecordTable } from '@/erkhet-sync/settings/stage-in-erkhet-movement-config/components/MovementConfigRecordTable';
import { useMovementConfigs } from '@/erkhet-sync/settings/stage-in-erkhet-movement-config/hooks/useMovementConfigs';
import { Spinner } from 'erxes-ui';

export const MovementConfigAddSheetConnected = () => {
  const { addConfig, saveLoading } = useMovementConfigs();
  return <MovementConfigAddSheet onSubmit={addConfig} loading={saveLoading} />;
};

export const StageInErkhetMovementConfig = () => {
  const {
    configs,
    loading,
    saveLoading,
    editConfig,
    deleteConfig,
    deleteManyConfigs,
  } = useMovementConfigs();

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <MovementConfigRecordTable
        configs={configs}
        onEdit={editConfig}
        onDelete={deleteConfig}
        onDeleteMany={deleteManyConfigs}
        editLoading={saveLoading}
      />
    </div>
  );
};
