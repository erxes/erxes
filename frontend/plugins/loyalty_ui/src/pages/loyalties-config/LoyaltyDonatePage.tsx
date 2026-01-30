import { PageContainer } from 'erxes-ui';
import { useQueryState } from 'erxes-ui';
import { DonationRecordTable } from '../../modules/loyalties/settings/donate/components/DonationRecordTable';
import { LoyaltyDonationEditSheet } from '../../modules/loyalties/settings/donate/donation-detail/components/LoyaltyDonationEditSheet';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';
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
