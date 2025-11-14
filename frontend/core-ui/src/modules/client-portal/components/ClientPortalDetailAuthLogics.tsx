import { InfoCard, ScrollArea, Tabs, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { ClientPortalDetailOTP } from './ClientPortalDetailOTPf';
import { ClientPortalDetail2FA } from './ClientPortalDetail2FA';
import { ClientPortalDetailConfirmationEmail } from './ClientPortalDetailConfirmationEmail';
import { ClientPortalDetailResetPassword } from './ClientPortalDetailPasswordVerification';
import { ClientPortalDetailManual } from './ClientPortalDetailManual';
import { IClientPortal } from '../types/clientPortal';

export const ClientPortalDetailAuthLogics = ({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) => {
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
        <ScrollArea.Bar orientation="horizontal" />

        <Tabs value={authLogic} className="p-2">
          <Tabs.Content value="otp">
            <ClientPortalDetailOTP clientPortal={clientPortal} />
          </Tabs.Content>
          <Tabs.Content value="two-factor">
            <ClientPortalDetail2FA clientPortal={clientPortal} />
          </Tabs.Content>
          <Tabs.Content value="confirm">
            <ClientPortalDetailConfirmationEmail clientPortal={clientPortal} />
          </Tabs.Content>
          <Tabs.Content value="reset">
            <ClientPortalDetailResetPassword clientPortal={clientPortal} />
          </Tabs.Content>
          <Tabs.Content value="manual">
            <ClientPortalDetailManual clientPortal={clientPortal} />
          </Tabs.Content>
        </Tabs>
      </InfoCard.Content>
    </InfoCard>
  );
};
