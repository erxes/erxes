import { Button, RecordTable } from 'erxes-ui';
import { pricingColumns } from '@/pricing/components/PricingColumns';
import { PricingCommandBar } from '@/pricing/components/PricingCommandBar';
import { usePricing } from '@/pricing/hooks/usePricing';
import { IconCoins, IconPlus } from '@tabler/icons-react';
import { PricingCreateSheet } from '@/pricing/create-pricing/PricingCreateSheet';

export function PricingRecordTable() {
  const { pricing, loading, totalCount } = usePricing();

  if (!loading && totalCount === 0) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
        <IconCoins size={64} stroke={1.5} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold text-muted-foreground">
          No pricing yet
        </h2>
        <p className="mb-4 text-md text-muted-foreground">
          Add your first pricing to get started.
        </p>
        <PricingCreateSheet
          trigger={
            <Button variant="outline">
              <IconPlus />
              Create Pricing
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <RecordTable.Provider
      data={pricing || []}
      columns={pricingColumns}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={30} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <PricingCommandBar />
    </RecordTable.Provider>
  );
}
