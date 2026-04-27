import { PageHeader } from 'ui-modules';
import { LoyaltySpinAddSheet } from './SpinAddSheet';

export const LoyaltySpinHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <LoyaltySpinAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
