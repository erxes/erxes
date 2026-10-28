import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { EmailAddressesRecordTable } from '@/settings/email-addresses/components/EmailAddressesRecordTable';
import { EmailDeliveriesRecordTable } from '@/settings/email-deliveries/components/EmailDeliveriesRecordTable';
import { Tabs, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TeamMemberActivityLogSheet = ({
  email,
  open,
  onOpenChange,
}: {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): JSX.Element => {
  const [, setDeliveryId] = useQueryState<string>('deliveryId');
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <CoreModulePanel
      name={`settings/team-member/activity/${email}`}
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setDeliveryId(null);
        onOpenChange(nextOpen);
      }}
    >
      <CoreModulePanel.View className="flex flex-col gap-0 sm:max-w-6xl">
        <CoreModulePanel.Header>
          <CoreModulePanel.Title>{t('activity-log')}</CoreModulePanel.Title>
          <CoreModulePanel.Close />
        </CoreModulePanel.Header>
        <CoreModulePanel.Content className="min-h-0 flex-1 overflow-auto">
          {open &&
            (email.trim() ? (
              <Tabs key={email} defaultValue="messages">
                <p className="px-4 pt-4 text-sm text-muted-foreground">
                  {email}
                </p>
                <Tabs.List
                  className="w-full justify-start px-4"
                  aria-label="Email activity"
                >
                  <Tabs.Trigger value="messages">{t('messages')}</Tabs.Trigger>
                  <Tabs.Trigger value="addresses">
                    {t('addresses')}
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="messages">
                  <EmailDeliveriesRecordTable
                    email={email.trim().toLowerCase()}
                  />
                </Tabs.Content>
                <Tabs.Content value="addresses">
                  <EmailAddressesRecordTable
                    email={email.trim().toLowerCase()}
                  />
                </Tabs.Content>
              </Tabs>
            ) : (
              <p className="p-4 text-muted-foreground">
                {t('no-email-address')}
              </p>
            ))}
        </CoreModulePanel.Content>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
