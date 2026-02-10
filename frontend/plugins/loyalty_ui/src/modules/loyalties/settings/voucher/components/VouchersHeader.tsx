import { PageHeader } from 'ui-modules';
import { LoyaltyVoucherAddSheet } from './VoucherAddSheet';

export const LoyaltyVoucherAddHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <LoyaltyVoucherAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
