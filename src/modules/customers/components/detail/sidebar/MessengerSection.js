import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { Label } from 'modules/common/components';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function MessengerSection({ customer }) {
  const { messengerData } = customer;

  if (!messengerData) {
    return null;
  }

  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Messenger</Title>
      <SidebarList className="no-link">
        <li>
          Status
          <SidebarCounter>
            {messengerData.isActive ? (
              <Label lblStyle="success">Online</Label>
            ) : (
              <Label>Offline</Label>
            )}
          </SidebarCounter>
        </li>
        <li>
          Last online
          <SidebarCounter>
            {moment(messengerData.lastSeenAt).fromNow()}
          </SidebarCounter>
        </li>
        <li>
          Session count
          <SidebarCounter>{messengerData.sessionCount}</SidebarCounter>
        </li>
      </SidebarList>
    </Wrapper.Sidebar.Section>
  );
}

MessengerSection.propTypes = propTypes;

export default MessengerSection;
