import { useTranslation } from 'react-i18next';
import { TMovementErkhetConfig } from '../types';
import { buildMovementConfigColumns } from './MovementConfigColumns';
import { MovementConfigCommandBar } from './MovementConfigCommandBar';
import { ErkhetConfigRecordTable } from '../../shared/components/ErkhetConfigRecordTable';

type TConfigRow = TMovementErkhetConfig & { _id: string };

interface Props {
  configs: TConfigRow[];
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
      columns={buildMovementConfigColumns(onEdit, onDelete, editLoading)}
      emptyDescription={t('create-first-movement-config')}
      commandBar={<MovementConfigCommandBar onDeleteMany={onDeleteMany} loading={editLoading} />}
    />
  );
};
