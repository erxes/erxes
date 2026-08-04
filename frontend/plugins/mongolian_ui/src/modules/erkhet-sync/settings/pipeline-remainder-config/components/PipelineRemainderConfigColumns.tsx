import { IconAt, IconLayoutKanban } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { AddPipelineRemainderConfig } from '../types';
import { TRemainderConfigRow } from '../hooks/usePipelineRemainderConfigs';
import { PipelineRemainderConfigEditSheet } from './PipelineRemainderConfigEditSheet';
import {
  buildErkhetConfigBaseColumns,
  erkhetConfigTextColumn,
} from '../../shared/components/ErkhetConfigColumns';

export const buildRemainderConfigColumns = (
  t: TFunction,
  onEdit: (id: string, data: AddPipelineRemainderConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TRemainderConfigRow>[] => [
  ...buildErkhetConfigBaseColumns<TRemainderConfigRow>({
    t,
    onDelete,
    editLoading,
    renderEditSheet: (config, open, onOpenChange) => (
      <PipelineRemainderConfigEditSheet
        config={config}
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={onEdit}
        loading={editLoading}
      />
    ),
  }),
  erkhetConfigTextColumn<TRemainderConfigRow>({
    t,
    id: 'account',
    icon: IconAt,
    labelKey: 'account',
  }),
  erkhetConfigTextColumn<TRemainderConfigRow>({
    t,
    id: 'location',
    icon: IconLayoutKanban,
    labelKey: 'location',
  }),
];
