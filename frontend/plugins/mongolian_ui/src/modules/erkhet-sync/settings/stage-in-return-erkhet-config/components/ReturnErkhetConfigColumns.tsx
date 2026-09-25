import { IconAt, IconLayoutKanban } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { TReturnErkhetConfig } from '../types';
import { TReturnErkhetConfigRow } from '../hooks/useReturnErkhetConfigs';
import { RETURN_TYPES } from '../constants/returnTypesData';
import { ReturnErkhetConfigEditSheet } from './ReturnErkhetConfigEditSheet';
import {
  buildErkhetConfigBaseColumns,
  erkhetConfigTextColumn,
} from '../../shared/components/ErkhetConfigColumns';

const returnTypeLabel = (value: string) =>
  RETURN_TYPES.find((type) => type.value === value)?.label ?? (value || '—');

export const buildReturnErkhetConfigColumns = (
  t: TFunction,
  onEdit: (id: string, data: TReturnErkhetConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TReturnErkhetConfigRow>[] => [
  ...buildErkhetConfigBaseColumns<TReturnErkhetConfigRow>({
    t,
    onDelete,
    editLoading,
    renderEditSheet: (config, open, onOpenChange) => (
      <ReturnErkhetConfigEditSheet
        config={config}
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={onEdit}
        loading={editLoading}
      />
    ),
  }),
  erkhetConfigTextColumn<TReturnErkhetConfigRow>({
    t,
    id: 'userEmail',
    icon: IconAt,
    labelKey: 'user-email',
  }),
  erkhetConfigTextColumn<TReturnErkhetConfigRow>({
    t,
    id: 'returnType',
    icon: IconLayoutKanban,
    labelKey: 'return-type',
    format: returnTypeLabel,
  }),
];
