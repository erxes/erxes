import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { EmailDeliveriesRecordTable } from '@/settings/email-deliveries/components/EmailDeliveriesRecordTable';
import { EmailDeliveriesRecordTableFilter } from '@/settings/email-deliveries/components/filters/EmailDeliveriesRecordTableFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export function EmailDeliveriesPage() {
  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <PageSubHeader>
        <EmailDeliveriesRecordTableFilter />
      </PageSubHeader>
      <EmailDeliveriesRecordTable />
    </PageContainer>
  );
}
