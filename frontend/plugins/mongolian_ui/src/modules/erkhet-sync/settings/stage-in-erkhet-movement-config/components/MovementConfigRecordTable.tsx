import { IconSettings2 } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { TMovementErkhetConfig } from '../types';
import { buildMovementConfigColumns } from './MovementConfigColumns';

type TConfigRow = TMovementErkhetConfig & { _id: string };

interface Props {
  configs: TConfigRow[];
  onEdit: (id: string, data: TMovementErkhetConfig) => Promise<void>;
  onDelete: (id: string) => void;
  editLoading: boolean;
}

export const MovementConfigRecordTable = ({
  configs,
  onEdit,
  onDelete,
  editLoading,
}: Props) => {
  const columns = buildMovementConfigColumns(onEdit, onDelete, editLoading);

  return (
    <RecordTable.Provider
      columns={columns}
      data={configs}
      className="m-3"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      {configs.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <IconSettings2 size={48} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              No configs yet
            </h3>
            <p className="text-sm text-gray-500">
              Create your first movement config using the button above.
            </p>
          </div>
        </div>
      )}
    </RecordTable.Provider>
  );
};
