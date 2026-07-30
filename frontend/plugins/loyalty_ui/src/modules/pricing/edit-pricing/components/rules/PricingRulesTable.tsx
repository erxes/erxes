import { ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  PricingRuleCommandBar,
  PricingRuleMoreCell,
} from '@/pricing/edit-pricing/components/rules/PricingRuleActions';
import {
  PricingRuleConfig,
  PricingRuleType,
} from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';

interface PricingRulesTableProps {
  ruleType: PricingRuleType;
  rules: PricingRuleConfig[];
  title: string;
  onEdit: (rule: PricingRuleConfig) => void;
  onDelete: (rule: PricingRuleConfig) => void;
  onDeleteMany: (rules: PricingRuleConfig[]) => void;
  disabled?: boolean;
}

type PricingRuleTextField =
  | 'ruleType'
  | 'ruleValue'
  | 'discountType'
  | 'discountValue'
  | 'priceAdjustType'
  | 'priceAdjustFactor';

const getTextColumn = (
  id: PricingRuleTextField,
  label: string,
): ColumnDef<PricingRuleConfig> => ({
  id,
  accessorKey: id,
  header: () => <RecordTable.InlineHead label={label} />,
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      {String(cell.getValue() ?? '')}
    </RecordTableInlineCell>
  ),
});

export const PricingRulesTable = ({
  ruleType,
  rules,
  title,
  onEdit,
  onDelete,
  onDeleteMany,
  disabled,
}: PricingRulesTableProps) => {
  const { t } = useTranslation('loyalty');
  const tableId = `loyalty_pricing_${ruleType}_rules_record_table_v3`;
  const columns: ColumnDef<PricingRuleConfig>[] = [
    {
      id: 'more',
      header: () => <RecordTable.ColumnSelector />,
      cell: ({ row }) => (
        <PricingRuleMoreCell
          rule={row.original}
          title={title}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={disabled}
        />
      ),
      size: 33,
    },
    RecordTable.checkboxColumn as ColumnDef<PricingRuleConfig>,
    getTextColumn('ruleType', t('rule-type')),
    getTextColumn('ruleValue', t('rule-value')),
    getTextColumn('discountType', t('discount-type')),
    getTextColumn('discountValue', t('discount-value')),
    getTextColumn('priceAdjustType', t('price-adjust-type')),
    getTextColumn('priceAdjustFactor', t('price-adjust-factor')),
  ];

  return (
    <RecordTable.Provider
      key={tableId}
      columns={columns}
      data={rules}
      stickyColumns={['more', 'checkbox', 'ruleType']}
      tableId={tableId}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <PricingRuleCommandBar onDelete={onDeleteMany} disabled={disabled} />
    </RecordTable.Provider>
  );
};
