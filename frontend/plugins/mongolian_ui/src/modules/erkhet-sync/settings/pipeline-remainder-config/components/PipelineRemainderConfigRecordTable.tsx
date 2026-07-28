import { useTranslation } from 'react-i18next';
import { AddPipelineRemainderConfig } from '../types';
import { TRemainderConfigRow } from '../hooks/usePipelineRemainderConfigs';
import { buildRemainderConfigColumns } from './PipelineRemainderConfigColumns';
import { PipelineRemainderConfigCommandBar } from './PipelineRemainderConfigCommandBar';
import { ErkhetConfigRecordTable } from '../../shared/components/ErkhetConfigRecordTable';

interface Props {
  configs: TRemainderConfigRow[];
  onEdit: (id: string, data: AddPipelineRemainderConfig) => Promise<void>;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  editLoading: boolean;
}

export const PipelineRemainderConfigRecordTable = ({
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
      columns={buildRemainderConfigColumns(onEdit, onDelete, editLoading)}
      emptyDescription={t('create-first-remainder-config')}
      commandBar={<PipelineRemainderConfigCommandBar onDeleteMany={onDeleteMany} loading={editLoading} />}
    />
  );
};
