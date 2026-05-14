import { PageHeader } from 'ui-modules';
import { LoyaltyCouponAddSheet } from './CouponAddSheet';

export const LoyaltyCouponAddHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <LoyaltyCouponAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
