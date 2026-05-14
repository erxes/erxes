import { PipelineRemainderConfigAddSheet } from '@/erkhet-sync/settings/pipeline-remainder-config/components/PipelineRemainderConfigAddSheet';
import { PipelineRemainderConfigRecordTable } from '@/erkhet-sync/settings/pipeline-remainder-config/components/PipelineRemainderConfigRecordTable';
import { usePipelineRemainderConfigs } from '@/erkhet-sync/settings/pipeline-remainder-config/hooks/usePipelineRemainderConfigs';
import { Spinner } from 'erxes-ui';

export const RemainderConfigAddSheetConnected = () => {
  const { addConfig, saveLoading } = usePipelineRemainderConfigs();
  return <PipelineRemainderConfigAddSheet onSubmit={addConfig} loading={saveLoading} />;
};

export const PipelineRemainderConfig = () => {
  const { configs, loading, saveLoading, editConfig, deleteConfig, deleteManyConfigs } =
    usePipelineRemainderConfigs();

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PipelineRemainderConfigRecordTable
        configs={configs}
        onEdit={editConfig}
        onDelete={deleteConfig}
        onDeleteMany={deleteManyConfigs}
        editLoading={saveLoading}
      />
    </div>
  );
};
