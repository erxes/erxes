import { useTranslation } from 'react-i18next';
import { TErkhetConfig } from '../types';
import { TStageInErkhetConfigRow } from '../hooks/useStageInErkhetConfigs';
import { buildStageInErkhetConfigColumns } from './StageInErkhetConfigColumns';
import { StageInErkhetConfigCommandBar } from './StageInErkhetConfigCommandBar';
import { ErkhetConfigRecordTable } from '../../shared/components/ErkhetConfigRecordTable';

interface Props {
  configs: TStageInErkhetConfigRow[];
  onEdit: (id: string, data: TErkhetConfig) => Promise<void>;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  editLoading: boolean;
}

export const StageInErkhetConfigRecordTable = ({
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
      columns={buildStageInErkhetConfigColumns(onEdit, onDelete, editLoading)}
      emptyDescription={t('create-first-stage-in-erkhet-config')}
      commandBar={<StageInErkhetConfigCommandBar onDeleteMany={onDeleteMany} loading={editLoading} />}
    />
  );
};
