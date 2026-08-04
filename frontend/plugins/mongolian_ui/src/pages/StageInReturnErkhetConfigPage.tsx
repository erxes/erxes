import { ReturnErkhetConfigAddSheet } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/components/ReturnErkhetConfigAddSheet';
import { ReturnErkhetConfigRecordTable } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/components/ReturnErkhetConfigRecordTable';
import { useReturnErkhetConfigs } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/hooks/useReturnErkhetConfigs';
import { Spinner } from 'erxes-ui';

export const ReturnErkhetConfigAddSheetConnected = () => {
  const { addConfig, saveLoading } = useReturnErkhetConfigs();
  return <ReturnErkhetConfigAddSheet onSubmit={addConfig} loading={saveLoading} />;
};

export const StageInReturnErkhetConfig = () => {
  const { configs, loading, saveLoading, editConfig, deleteConfig, deleteManyConfigs } =
    useReturnErkhetConfigs();

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <ReturnErkhetConfigRecordTable
        configs={configs}
        onEdit={editConfig}
        onDelete={deleteConfig}
        onDeleteMany={deleteManyConfigs}
        editLoading={saveLoading}
      />
    </div>
  );
};
