import { EmailDeliveriesFilterBar } from '@/settings/email-deliveries/components/filters/EmailDeliveriesFilterBar';
import { EmailDeliveriesFilterPopover } from '@/settings/email-deliveries/components/filters/EmailDeliveriesFilterPopover';
import { EMAIL_DELIVERIES_CURSOR_SESSION_KEY } from '@/settings/email-deliveries/constants';
import { Filter } from 'erxes-ui';

export const EmailDeliveriesRecordTableFilter = () => (
  <Filter
    id="email-deliveries-filter"
    sessionKey={EMAIL_DELIVERIES_CURSOR_SESSION_KEY}
  >
    <Filter.Bar>
      <EmailDeliveriesFilterPopover />
      <EmailDeliveriesFilterBar />
    </Filter.Bar>
  </Filter>
);
