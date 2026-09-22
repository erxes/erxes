import { useTranslation } from 'react-i18next';
import { TMovementConfigRow, TMovementErkhetConfig } from '../types';
import { buildMovementConfigColumns } from './MovementConfigColumns';
import { MovementConfigCommandBar } from './MovementConfigCommandBar';
import { ErkhetConfigRecordTable } from '../../shared/components/ErkhetConfigRecordTable';

interface Props {
  configs: TMovementConfigRow[];
  onEdit: (id: string, data: TMovementErkhetConfig) => Promise<void>;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  editLoading: boolean;
}

export const MovementConfigRecordTable = ({
  configs,
  onEdit,
  onDelete,
  onDeleteMany,
  editLoading,
}: Props) => {
  const { t } = useTranslation('mongolian');
  return (
    <ErkhetConfigRecordTable
      configs={configs}
      columns={buildMovementConfigColumns(t, onEdit, onDelete, editLoading)}
      tableId="mongolian_erkhet_movement_config_record_table"
      emptyDescription={t('create-first-movement-config')}
      commandBar={
        <MovementConfigCommandBar
          onDeleteMany={onDeleteMany}
          loading={editLoading}
        />
      }
    />
  );
};
