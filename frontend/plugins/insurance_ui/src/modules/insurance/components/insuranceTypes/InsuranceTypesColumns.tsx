import { IconShieldCheck, IconList } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell, Badge } from 'erxes-ui';
import { InsuranceType } from '~/modules/insurance/types';
import { InsuranceTypesMoreColumn } from './InsuranceTypesMoreColumn';
import {
  createEntityMoreColumn,
  createNameColumn,
  createCreatedAtColumn,
  createUpdatedAtColumn,
} from '../shared';

// Custom attributes column specific to InsuranceTypes
const attributesColumn: ColumnDef<InsuranceType> = {
  id: 'attributes',
  accessorKey: 'attributes',
  header: () => <RecordTable.InlineHead icon={IconList} label="Attributes" />,
  cell: ({ cell }) => {
    const attributes = cell.getValue() as any[];
    return (
      <RecordTableInlineCell>
        <Badge variant="secondary">{attributes?.length || 0} attributes</Badge>
      </RecordTableInlineCell>
    );
  },
};

export const insuranceTypesColumns: ColumnDef<InsuranceType>[] = [
  createEntityMoreColumn<InsuranceType>(InsuranceTypesMoreColumn, 26),
  RecordTable.checkboxColumn as ColumnDef<InsuranceType>,
  createNameColumn<InsuranceType>(IconShieldCheck),
  attributesColumn,
  createCreatedAtColumn<InsuranceType>(),
  createUpdatedAtColumn<InsuranceType>(),
];
