import { LoyaltyConfigFormFields } from '~/modules/loyalties/settings/general-config/components/LoyaltyConfigFormFIelds';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';

export const LoyaltyGeneralConfig = () => {
  return (
    <LoyaltyLayout>
      <LoyaltyConfigFormFields />
    </LoyaltyLayout>
  );
};
