import { useTranslation } from 'react-i18next';
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
}: Props) => {
  const { t } = useTranslation('mongolian');
  return (
    <ErkhetConfigRecordTable
      configs={configs}
      columns={buildReturnErkhetConfigColumns(onEdit, onDelete, editLoading)}
      emptyDescription={t('create-first-return-erkhet-config')}
      commandBar={<ReturnErkhetConfigCommandBar onDeleteMany={onDeleteMany} loading={editLoading} />}
    />
  );
};
