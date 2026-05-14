import { IconAlertTriangle } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable } from 'erxes-ui';
import { RiskType } from '~/modules/insurance/types';
import { RisksMoreColumn } from './RisksMoreColumn';
import {
  createEntityMoreColumn,
  createNameColumn,
  createDescriptionColumn,
  createCreatedAtColumn,
  createUpdatedAtColumn,
} from '../shared';

export const risksColumns: ColumnDef<RiskType>[] = [
  createEntityMoreColumn<RiskType>(RisksMoreColumn, 18),
  RecordTable.checkboxColumn as ColumnDef<RiskType>,
  createNameColumn<RiskType>(IconAlertTriangle),
  createDescriptionColumn<RiskType>(),
  createCreatedAtColumn<RiskType>(),
  createUpdatedAtColumn<RiskType>(),
];
