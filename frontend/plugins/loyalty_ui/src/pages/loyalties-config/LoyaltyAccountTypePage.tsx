import { PageContainer } from 'erxes-ui';
import { LoyaltyAccountTypeLegacyBanner } from '~/modules/loyalties/settings/account-type/components/LoyaltyAccountTypeLegacyBanner';
import { LoyaltyPeriodRunPanel } from '~/modules/loyalties/settings/account-type/components/LoyaltyPeriodRunPanel';
import { LoyaltyAccountTypeTable } from '~/modules/loyalties/settings/account-type/components/LoyaltyAccountTypeTable';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';

export const LoyaltyAccountTypePage = () => {
  return (
    <LoyaltyLayout>
      <PageContainer>
        <LoyaltyAccountTypeLegacyBanner />
        <LoyaltyPeriodRunPanel />
        <LoyaltyAccountTypeTable />
      </PageContainer>
    </LoyaltyLayout>
  );
};
