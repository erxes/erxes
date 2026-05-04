import { IconCertificate } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useProductRules } from '@/products/settings/hooks/useProductRules';
import { productRuleColumns } from './productRuleColumns';
import { ProductRuleCommandBar } from './ProductRuleCommandBar';
import { ProductRuleSheet } from './ProductRuleSheet';

export const ProductRuleRecordTable = () => {
  const { productRules, loading } = useProductRules();

  if (!loading && (productRules?.length ?? 0) === 0) {
    return <EmptyStateRow />;
  }

  return (
    <RecordTable.Provider
      columns={productRuleColumns}
      data={productRules || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={10} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ProductRuleCommandBar />
    </RecordTable.Provider>
  );
};

function EmptyStateRow() {
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconCertificate
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No product rules yet
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        Get started by creating your first product rule.
      </p>
      <ProductRuleSheet />
    </div>
  );
}
