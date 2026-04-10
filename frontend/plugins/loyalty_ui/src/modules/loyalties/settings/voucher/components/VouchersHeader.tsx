import { PageHeader } from 'ui-modules';
import { LoyaltyVoucherAddSheet } from './VoucherAddSheet';
import { GenerateVoucherSheet } from './GenerateVoucherSheet';

export const LoyaltyVoucherAddHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <GenerateVoucherSheet />
        <LoyaltyVoucherAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
