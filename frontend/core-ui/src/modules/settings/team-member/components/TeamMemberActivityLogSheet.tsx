import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { EmailAddressesRecordTable } from '@/settings/email-addresses/components/EmailAddressesRecordTable';
import { EmailDeliveriesRecordTable } from '@/settings/email-deliveries/components/EmailDeliveriesRecordTable';
import { Tabs, useQueryState, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export const TeamMemberActivityLogSheet = ({
  memberId,
  email,
  open,
  onOpenChange,
}: {
  memberId: string;
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): JSX.Element | null => {
  const [, setDeliveryId] = useQueryState<string>('deliveryId');
  const { t } = useTranslation('settings', {
    keyPrefix: 'team-member',
  });
  const pagePanel = usePagePanel({
    name: `settings/team-member/activity/${memberId}`,
    open: open,
    onOpenChange: (nextOpen) => {
      if (!nextOpen) setDeliveryId(null);
      onOpenChange(nextOpen);
    },
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <>
          <RecordSidePanel.Header
            title={<>{t('email-deliveries')}</>}
            {...pagePanel.headerProps}
          />
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-y-auto',
              'min-h-0 flex-1 overflow-auto',
            )}
          >
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
                    <Tabs.Trigger value="messages">
                      {t('messages')}
                    </Tabs.Trigger>
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
          </div>
        </>
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
  );
};
