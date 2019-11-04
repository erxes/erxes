import dayjs from 'dayjs';
import EmptyState from 'modules/common/components/EmptyState';
import Label from 'modules/common/components/Label';
import { __, isTimeStamp, isValidDate } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import { ICustomer } from '../../types';

type Props = {
  customer: ICustomer;
  queryParams?: any;
  toggle?: any;
  isOpen?: boolean;
};

class MessengerSection extends React.Component<Props> {
  renderCustomValue = (value: string) => {
    if (isValidDate(value) || isTimeStamp(value)) {
      return dayjs(value).format('lll');
    }

    return value;
  };

  renderContent() {
    const { customer } = this.props;
    const { messengerData } = customer;

    if (!messengerData) {
      return <EmptyState icon="chat" text="Empty" size="small" />;
    }

    const customData = customer.getMessengerCustomData || [];

    return (
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
            {dayjs(messengerData.lastSeenAt).format('lll')}
          </SidebarCounter>
        </li>
        <li>
          {__('Session count')}
          <SidebarCounter>{messengerData.sessionCount}</SidebarCounter>
        </li>
        {customData.map((data, index) => (
          <li key={index}>
            {data.name}
            <SidebarCounter>
              {this.renderCustomValue(data.value)}
            </SidebarCounter>
          </li>
        ))}
      </SidebarList>
    );
  }

  render() {
    const { Section } = Sidebar;

    return <Section>{this.renderContent()}</Section>;
  }
}

export default MessengerSection;
