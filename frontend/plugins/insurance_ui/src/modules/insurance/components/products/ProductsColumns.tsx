import {
  IconPackage,
  IconCategory,
  IconShieldCheck,
  IconCalendar,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { InsuranceProduct } from '~/modules/insurance/types';
import { ProductsMoreColumn } from './ProductsMoreColumn';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('mn-MN');
};

export const createProductsColumns = (
  onEdit: (product: InsuranceProduct) => void,
  onDelete: (product: InsuranceProduct) => void,
): ColumnDef<InsuranceProduct>[] => [
  {
    id: 'more',
    accessorKey: 'more',
    header: '',
    cell: ({ cell }) => (
      <ProductsMoreColumn cell={cell} onEdit={onEdit} onDelete={onDelete} />
    ),
    size: 26,
  },
  RecordTable.checkboxColumn as ColumnDef<InsuranceProduct>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconPackage} label={t('name')} />;
    },
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
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconCategory} label={t('insurance-type')} />;
    },
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
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconShieldCheck} label={t('covered-risks')} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('insurance');
      const risks = cell.row.original.coveredRisks || [];
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">{risks.length} {t('risks')}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'riskDetails',
    accessorKey: 'riskDetails',
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconShieldCheck} label={t('risk-details')} />;
    },
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
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconCalendar} label={t('created-at')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
        </RecordTableInlineCell>
      );
    },
  },
];
