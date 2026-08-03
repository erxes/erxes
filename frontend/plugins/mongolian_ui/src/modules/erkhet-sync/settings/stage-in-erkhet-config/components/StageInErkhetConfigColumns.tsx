import { IconAt, IconLayoutKanban } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { TErkhetConfig } from '../types';
import { TStageInErkhetConfigRow } from '../hooks/useStageInErkhetConfigs';
import { StageInErkhetConfigEditSheet } from './StageInErkhetConfigEditSheet';
import {
  buildErkhetConfigBaseColumns,
  erkhetConfigTextColumn,
} from '../../shared/components/ErkhetConfigColumns';

export const buildStageInErkhetConfigColumns = (
  t: TFunction,
  onEdit: (id: string, data: TErkhetConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TStageInErkhetConfigRow>[] => [
  ...buildErkhetConfigBaseColumns<TStageInErkhetConfigRow>({
    t,
    onDelete,
    editLoading,
    renderEditSheet: (config, open, onOpenChange) => (
      <StageInErkhetConfigEditSheet
        config={config}
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={onEdit}
        loading={editLoading}
      />
    ),
  }),
  erkhetConfigTextColumn<TStageInErkhetConfigRow>({
    t,
    id: 'userEmail',
    icon: IconAt,
    labelKey: 'user-email',
  }),
  erkhetConfigTextColumn<TStageInErkhetConfigRow>({
    t,
    id: 'responseField',
    icon: IconLayoutKanban,
    labelKey: 'response-field',
  }),
  erkhetConfigTextColumn<TStageInErkhetConfigRow>({
    t,
    id: 'defaultPay',
    icon: IconLayoutKanban,
    labelKey: 'default-pay',
    size: 150,
  }),
];
