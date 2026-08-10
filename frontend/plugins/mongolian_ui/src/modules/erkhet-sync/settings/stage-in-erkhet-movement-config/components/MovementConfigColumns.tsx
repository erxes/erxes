import { IconAt, IconLayoutKanban, IconUser } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { TMovementConfigRow, TMovementErkhetConfig } from '../types';
import { MovementConfigEditSheet } from './MovementConfigEditSheet';
import {
  buildErkhetConfigBaseColumns,
  erkhetConfigTextColumn,
} from '../../shared/components/ErkhetConfigColumns';

export const buildMovementConfigColumns = (
  t: TFunction,
  onEdit: (id: string, data: TMovementErkhetConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TMovementConfigRow>[] => [
  ...buildErkhetConfigBaseColumns<TMovementConfigRow>({
    t,
    onDelete,
    editLoading,
    renderEditSheet: (config, open, onOpenChange) => (
      <MovementConfigEditSheet
        config={config}
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={onEdit}
        loading={editLoading}
      />
    ),
  }),
  erkhetConfigTextColumn<TMovementConfigRow>({
    t,
    id: 'userEmail',
    icon: IconAt,
    labelKey: 'user-email',
  }),
  erkhetConfigTextColumn<TMovementConfigRow>({
    t,
    id: 'defaultCustomer',
    icon: IconUser,
    labelKey: 'default-customer',
    size: 160,
  }),
  erkhetConfigTextColumn<TMovementConfigRow>({
    t,
    id: 'responseField',
    icon: IconLayoutKanban,
    labelKey: 'response-field',
    size: 160,
  }),
];
