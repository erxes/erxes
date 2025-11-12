import { InfoCard, Tabs, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { ClientPortalDetailOtp } from './ClientPortalDetailOtp';

export const ClientPortalDetailAuthLogics = () => {
  const [authLogic, setAuthLogic] = useState<string>('otp');
  return (
    <InfoCard title="Account Security & Verification">
      <InfoCard.Content>
        <ToggleGroup
          type="single"
          value={authLogic}
          onValueChange={setAuthLogic}
          variant="outline"
        >
          <ToggleGroup.Item value="otp" className="flex-auto">
            One-time password
          </ToggleGroup.Item>
          <ToggleGroup.Item value="two-factor" className="flex-auto">
            Two-factor authentication
          </ToggleGroup.Item>
          <ToggleGroup.Item value="confirm" className="flex-auto">
            Confirmation email
          </ToggleGroup.Item>
          <ToggleGroup.Item value="reset" className="flex-auto">
            Reset password email
          </ToggleGroup.Item>
          <ToggleGroup.Item value="manual" className="flex-auto">
            Manual verification
          </ToggleGroup.Item>
        </ToggleGroup>
        <Tabs value={authLogic} className="p-2">
          <Tabs.Content value="otp">
            <ClientPortalDetailOtp />
          </Tabs.Content>
          <Tabs.Content value="two-factor">
            {/* <ClientPortalDetailTwoFactor /> */}
          </Tabs.Content>
          <Tabs.Content value="confirm">
            {/* <ClientPortalDetailConfirm /> */}
          </Tabs.Content>
        </Tabs>
      </InfoCard.Content>
    </InfoCard>
  );
};
