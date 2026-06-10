import { IconClipboardList } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';

import { MS_DYNAMIC_CONFIG_CURSOR_SESSION_KEY } from '../../constants/msDynamicConfigSessionKey';
import { useMSDynamicConfigActions } from '../../hooks/useMSDynamicConfigActions';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { AddMSDynamicConfig } from './AddMSDynamicConfig';
import { msDynamicConfigColumns } from './MSDynamicConfigColumn';
import { MSDynamicConfigCommandBar } from './MSDynamicConfigCommandBar';

export const MSDynamicConfigTable = () => {
  const {
    configsMap,
    loading: configsLoading,
    saveConfigs,
    saveLoading,
  } = useMSDynamicConfigs();
  const { loading, rows } = useMSDynamicConfigActions({
    configsMap,
    saveConfigs,
  });

  return (
    <RecordTable.Provider
      columns={msDynamicConfigColumns}
      data={rows}
    >
      <RecordTable.Scroll>
        <RecordTable.CursorProvider
          dataLength={rows.length}
          sessionKey={MS_DYNAMIC_CONFIG_CURSOR_SESSION_KEY}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {(configsLoading || loading || saveLoading) && (
                <RecordTable.RowSkeleton rows={4} />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
        {!(configsLoading || loading || saveLoading) && rows.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <IconClipboardList size={48} className="mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                No MS Dynamic config yet
              </h3>
              <p className="mb-4 mt-1 text-sm text-gray-500">
                Get started by creating your first MS Dynamic config.
              </p>
              <AddMSDynamicConfig />
            </div>
          </div>
        )}
      </RecordTable.Scroll>
      <MSDynamicConfigCommandBar />
    </RecordTable.Provider>
  );
};
