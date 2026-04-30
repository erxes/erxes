import { PageSubHeader, Spinner } from 'erxes-ui';
import { useMovementConfigs } from '../hooks/useMovementConfigs';
import { MovementConfigAddSheet } from './MovementConfigAddSheet';
import { MovementConfigRecordTable } from './MovementConfigRecordTable';

export const StageInErkhetMovementConfigForm = () => {
  const { configs, loading, saveLoading, addConfig, editConfig, deleteConfig } =
    useMovementConfigs();

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PageSubHeader>
        <div className="flex-1" />
        <MovementConfigAddSheet onSubmit={addConfig} loading={saveLoading} />
      </PageSubHeader>
      <MovementConfigRecordTable
        configs={configs}
        onEdit={editConfig}
        onDelete={deleteConfig}
        editLoading={saveLoading}
      />
    </div>
  );
};
