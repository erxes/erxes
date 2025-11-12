import { InfoCard, Tabs, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { ClientPortalDetailOTP } from './ClientPortalDetailOTPfuck';
import { ClientPortalDetail2FA } from './ClientPortalDetail2FA';
import { ClientPortalDetailConfirmationEmail } from './ClientPortalDetailConfirmationEmail';
import { ClientPortalDetailResetPassword } from './ClientPortalDetailResetPassword';
import { ClientPortalDetailManual } from './ClientPortalDetailManual';

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
            <ClientPortalDetailOTP />
          </Tabs.Content>
          <Tabs.Content value="two-factor">
            <ClientPortalDetail2FA />
          </Tabs.Content>
          <Tabs.Content value="confirm">
            <ClientPortalDetailConfirmationEmail />
          </Tabs.Content>
          <Tabs.Content value="reset">
            <ClientPortalDetailResetPassword />
          </Tabs.Content>
          <Tabs.Content value="manual">
            <ClientPortalDetailManual />
          </Tabs.Content>
        </Tabs>
      </InfoCard.Content>
    </InfoCard>
  );
};
