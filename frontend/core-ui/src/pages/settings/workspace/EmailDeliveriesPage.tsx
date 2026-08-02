import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { EmailAddressesRecordTable } from '@/settings/email-addresses/components/EmailAddressesRecordTable';
import { EmailAddressesRecordTableFilter } from '@/settings/email-addresses/components/filters/EmailAddressesRecordTableFilter';
import { EmailDeliveriesRecordTable } from '@/settings/email-deliveries/components/EmailDeliveriesRecordTable';
import {
  EmailDeliveryViewToggle,
  useEmailDeliveryView,
} from '@/settings/email-deliveries/components/EmailDeliveryViewToggle';
import { EmailDeliveriesRecordTableFilter } from '@/settings/email-deliveries/components/filters/EmailDeliveriesRecordTableFilter';
import { EmailRampPanel } from '@/settings/email-ramp/components/EmailRampPanel';
import { PageContainer, PageSubHeader, Separator } from 'erxes-ui';

export function EmailDeliveriesPage() {
  const { view } = useEmailDeliveryView();

  return (
    <PageContainer>
      <SettingsBreadcrumbs>
        <Separator.Inline />
        <EmailDeliveryViewToggle />
      </SettingsBreadcrumbs>

      {/* Each list filters on its own keys, so the bars cannot be shared, and
          the limits view has nothing to filter. */}
      {view !== 'limits' && (
        <PageSubHeader>
          {view === 'addresses' ? (
            <EmailAddressesRecordTableFilter />
          ) : (
            <EmailDeliveriesRecordTableFilter />
          )}
        </PageSubHeader>
      )}

      {view === 'limits' && <EmailRampPanel />}
      {view === 'addresses' && <EmailAddressesRecordTable />}
      {view === 'messages' && <EmailDeliveriesRecordTable />}
    </PageContainer>
  );
}
