import { TReturnErkhetConfig } from '../types';
import { TReturnErkhetConfigRow } from '../hooks/useReturnErkhetConfigs';
import { buildReturnErkhetConfigColumns } from './ReturnErkhetConfigColumns';
import { ReturnErkhetConfigCommandBar } from './ReturnErkhetConfigCommandBar';
import { ErkhetConfigRecordTable } from '../../shared/components/ErkhetConfigRecordTable';

interface Props {
  configs: TReturnErkhetConfigRow[];
  onEdit: (id: string, data: TReturnErkhetConfig) => Promise<void>;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  editLoading: boolean;
}

export const ReturnErkhetConfigRecordTable = ({
  configs,
  onEdit,
  onDelete,
  onDeleteMany,
  editLoading,
}: Props) => (
  <ErkhetConfigRecordTable
    configs={configs}
    columns={buildReturnErkhetConfigColumns(onEdit, onDelete, editLoading)}
    emptyDescription="Create your first return erkhet config using the button above."
    commandBar={<ReturnErkhetConfigCommandBar onDeleteMany={onDeleteMany} loading={editLoading} />}
  />
);
