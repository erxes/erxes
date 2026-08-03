import { EmailAddressesFilterBar } from '@/settings/email-addresses/components/filters/EmailAddressesFilterBar';
import { EmailAddressesFilterPopover } from '@/settings/email-addresses/components/filters/EmailAddressesFilterPopover';
import { EMAIL_ADDRESSES_CURSOR_SESSION_KEY } from '@/settings/email-addresses/constants';
import { Filter } from 'erxes-ui';

export const EmailAddressesRecordTableFilter = () => (
  <Filter
    id="email-addresses-filter"
    sessionKey={EMAIL_ADDRESSES_CURSOR_SESSION_KEY}
  >
    <Filter.Bar>
      <EmailAddressesFilterPopover />
      <EmailAddressesFilterBar />
    </Filter.Bar>
  </Filter>
);
