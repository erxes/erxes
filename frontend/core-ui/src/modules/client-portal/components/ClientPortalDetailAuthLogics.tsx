import { InfoCard, ScrollArea, Tabs, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { ClientPortalDetail2FA } from './ClientPortalDetail2FA';
import { ClientPortalDetailResetPassword } from './ClientPortalDetailPasswordVerification';
import { ClientPortalDetailManual } from './ClientPortalDetailManual';
import { IClientPortal } from '../types/clientPortal';
import { useTranslation } from 'react-i18next';

export const ClientPortalDetailAuthLogics = ({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const [authLogic, setAuthLogic] = useState<string>('two-factor');
  return (
    <InfoCard title={t('account-security-verification')}>
      <InfoCard.Content>
        <ToggleGroup
          type="single"
          value={authLogic}
          onValueChange={setAuthLogic}
          variant="outline"
        >
          <ToggleGroup.Item value="two-factor" className="flex-auto">
            {t('two-factor-authentication')}
          </ToggleGroup.Item>

          <ToggleGroup.Item value="reset" className="flex-auto">
            {t('reset-password-email')}
          </ToggleGroup.Item>
          <ToggleGroup.Item value="manual" className="flex-auto">
            {t('manual-verification')}
          </ToggleGroup.Item>
        </ToggleGroup>
        <ScrollArea.Bar orientation="horizontal" />

        <Tabs value={authLogic} className="p-2">
          <Tabs.Content value="two-factor">
            <ClientPortalDetail2FA clientPortal={clientPortal} />
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
