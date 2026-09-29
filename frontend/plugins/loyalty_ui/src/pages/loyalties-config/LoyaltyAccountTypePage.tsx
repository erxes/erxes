import { PageContainer } from 'erxes-ui';
import { LoyaltyAccountTypeLegacyBanner } from '~/modules/loyalties/settings/account-type/components/LoyaltyAccountTypeLegacyBanner';
import { LoyaltyAccountTypeTable } from '~/modules/loyalties/settings/account-type/components/LoyaltyAccountTypeTable';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';

export const LoyaltyAccountTypePage = () => {
  return (
    <LoyaltyLayout>
      <PageContainer>
        <LoyaltyAccountTypeLegacyBanner />
        <LoyaltyAccountTypeTable />
      </PageContainer>
    </LoyaltyLayout>
  );
};
