import {
  IconPackage,
  IconCategory,
  IconShieldCheck,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { InsuranceProduct } from '~/modules/insurance/types';
import { createCreatedAtColumn } from '../shared';
import { ProductsMoreColumn } from './ProductsMoreColumn';

export const createProductsColumns = (
  onEdit: (product: InsuranceProduct) => void,
  onDelete: (product: InsuranceProduct) => void,
  labels: {
    name: string;
    insuranceType: string;
    coveredRisks: string;
    risks: string;
    riskDetails: string;
    createdAt: string;
  },
): ColumnDef<InsuranceProduct>[] => [
  {
    id: 'more',
    accessorKey: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ cell }) => (
      <ProductsMoreColumn cell={cell} onEdit={onEdit} onDelete={onDelete} />
    ),
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<InsuranceProduct>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconPackage} label={labels.name} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'insuranceType',
    accessorKey: 'insuranceType',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCategory}
        label={labels.insuranceType}
      />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={cell.row.original.insuranceType?.name || ''}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'coveredRisks',
    accessorKey: 'coveredRisks',
    header: () => (
      <RecordTable.InlineHead
        icon={IconShieldCheck}
        label={labels.coveredRisks}
      />
    ),
    cell: ({ cell }) => {
      const risks = cell.row.original.coveredRisks || [];
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">
            {risks.length} {labels.risks}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'riskDetails',
    accessorKey: 'riskDetails',
    header: () => (
      <RecordTable.InlineHead
        icon={IconShieldCheck}
        label={labels.riskDetails}
      />
    ),
    cell: ({ cell }) => {
      const risks = cell.row.original.coveredRisks || [];
      const riskNames = risks
        .slice(0, 2)
        .map((cr) => cr.risk?.name)
        .filter(Boolean)
        .join(', ');
      const moreCount = risks.length > 2 ? ` +${risks.length - 2}` : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={riskNames + moreCount} />
        </RecordTableInlineCell>
      );
    },
  },
  createCreatedAtColumn<InsuranceProduct>(labels.createdAt),
];
