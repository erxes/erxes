import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { Label } from 'modules/common/components';
import { BaseSection } from './';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function MessengerSection({ customer }, { __, queryParams }) {
  const { messengerData } = customer;

  if (!(messengerData || queryParams)) {
    return null;
  }

  const content = messengerData ? (
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
    </SidebarList>
  ) : null;

  return (
    <BaseSection
      title={__('Messenger usage')}
      content={content}
      isUseCustomer={true}
      name="showMessenger"
    />
  );
}

MessengerSection.propTypes = propTypes;
MessengerSection.contextTypes = {
  __: PropTypes.func,
  queryParams: PropTypes.object
};

export default MessengerSection;
