import { PricingHeader } from '@/pricing/components/PricingHeader';
import { PricingSubHeader } from '@/pricing/components/PricingSubHeader';
import { PricingRecordTable } from '@/pricing/components/PricingRecordTable';

export function PricingView() {
  return (
    <>
      <PricingHeader />
      <PricingSubHeader />
      <PricingRecordTable />
    </>
  );
}
