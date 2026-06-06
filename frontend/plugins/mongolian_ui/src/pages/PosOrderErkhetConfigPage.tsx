import { Spinner } from 'erxes-ui';
import {
  PosOrderErkhetConfigAddSheet,
  PosOrderErkhetConfigRecordTable,
} from '~/modules/erkhet-sync/settings/pos-order-erkhet-config/components/PosOrderErkhetConfig';
import {
  TPosOrderErkhetConfig,
  usePosOrderErkhetConfigs,
} from '~/modules/erkhet-sync/settings/pos-order-erkhet-config/hooks/usePosOrderErkhetConfigs';

export const PosOrderErkhetConfigAddSheetConnected = () => {
  const { poss, saveConfig, saveLoading } = usePosOrderErkhetConfigs();

  return (
    <PosOrderErkhetConfigAddSheet
      loading={saveLoading}
      onSubmit={saveConfig}
      poss={poss}
    />
  );
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
