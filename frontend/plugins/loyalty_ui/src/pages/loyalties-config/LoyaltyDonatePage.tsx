import { PageContainer, useQueryState } from 'erxes-ui';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';
import { DonationRecordTable } from '../../modules/loyalties/settings/donate/components/DonationRecordTable';
import { LoyaltyDonationEditSheet } from '../../modules/loyalties/settings/donate/donation-detail/components/LoyaltyDonationEditSheet';

export const LoyaltyDonatePage = () => {
  const [editDonationId] = useQueryState<string>('editDonationId');

  return (
    <LoyaltyLayout>
      <PageContainer>
        <DonationRecordTable />
        {editDonationId && (
          <LoyaltyDonationEditSheet donationId={editDonationId} />
        )}
      </PageContainer>
    </LoyaltyLayout>
  );
};
