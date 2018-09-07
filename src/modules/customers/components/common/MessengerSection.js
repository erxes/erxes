import * as React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Label } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function MessengerSection({ customer }, { __, queryParams }) {
  const { Section } = Sidebar;
  const { Title } = Section;

  const { messengerData } = customer;

  if (!(messengerData || queryParams)) {
    return null;
  }

  const customData = customer.getMessengerCustomData || [];

  return (
    <Section>
      <Title>{__('Messenger data')}</Title>

      <SidebarList className="no-link">
        <li>
          {__('Status')}
          <SidebarCounter>
            {messengerData.isActive ? (
              <Label lblStyle="success">Online</Label>
            ) : (
              <Label>Offline</Label>
            )}
          </SidebarCounter>
        </li>
        <li>
          {__('Last online')}
          <SidebarCounter>
            {moment(messengerData.lastSeenAt).format('lll')}
          </SidebarCounter>
        </li>
        <li>
          {__('Session count')}
          <SidebarCounter>{messengerData.sessionCount}</SidebarCounter>
        </li>
        {customData.map((data, index) => (
          <li key={index}>
            {data.name}
            <SidebarCounter>{data.value}</SidebarCounter>
          </li>
        ))}
      </SidebarList>
    </Section>
  );
}

MessengerSection.propTypes = propTypes;
MessengerSection.contextTypes = {
  __: PropTypes.func,
  queryParams: PropTypes.object
};

export default MessengerSection;
