import { InfoCard, Tabs, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { IClientPortal } from '../types/clientPortal';
import { ClientPortalDetailGoogle } from './ClientPortalDetailGoogle';
import { ClientPortalDetailFacebook } from './ClientPortalDetailFacebook';
import { ClientPortalDetailSocialPay } from './ClientPortalDetailSocialPay';
import { ClientPortalDetailToki } from './ClientPortalDetailToki';

export const ClientPortalDetail3rdPartyAuths = ({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) => {
  const [authType, setAuthType] = useState<string>('google');
  return (
    <InfoCard title="Third Party Authentication">
      <InfoCard.Content>
        <ToggleGroup
          type="single"
          value={authType}
          onValueChange={setAuthType}
          variant="outline"
        >
          <ToggleGroup.Item value="google" className="flex-auto">
            Google
          </ToggleGroup.Item>
          <ToggleGroup.Item value="facebook" className="flex-auto">
            Facebook
          </ToggleGroup.Item>
          <ToggleGroup.Item value="socialpay" className="flex-auto">
            SocialPay
          </ToggleGroup.Item>
          <ToggleGroup.Item value="toki" className="flex-auto">
            Toki
          </ToggleGroup.Item>
        </ToggleGroup>
        <Tabs value={authType} onValueChange={setAuthType}>
          <Tabs.Content value="google">
            <ClientPortalDetailGoogle clientPortal={clientPortal} />
          </Tabs.Content>
          <Tabs.Content value="facebook">
            <ClientPortalDetailFacebook clientPortal={clientPortal} />
          </Tabs.Content>
          <Tabs.Content value="socialpay">
            <ClientPortalDetailSocialPay clientPortal={clientPortal} />
          </Tabs.Content>

          <Tabs.Content value="toki">
            <ClientPortalDetailToki clientPortal={clientPortal} />
          </Tabs.Content>
        </Tabs>
      </InfoCard.Content>
    </InfoCard>
  );
};
