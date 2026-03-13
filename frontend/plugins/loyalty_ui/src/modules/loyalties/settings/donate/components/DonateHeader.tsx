import { PageHeader } from 'ui-modules';
import { LoyaltyDonationAddSheet } from './DonationAddSheet';

export const LoyaltyDonateHeader = () => {
  return (
    <PageHeader>
      <PageHeader.End>
        <LoyaltyDonationAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
