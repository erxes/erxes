import dayjs from 'dayjs';
import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import Label from 'modules/common/components/Label';
import { __, isTimeStamp, isValidDate } from 'modules/common/utils';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import { ICustomer } from '../../types';

type Props = {
  customer: ICustomer;
  queryParams?: any;
  collapseCallback?: () => void;
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
          <FieldStyle>{__('Status')}</FieldStyle>
          <SidebarCounter>
            {messengerData.isActive ? (
              <Label lblStyle="success">Online</Label>
            ) : (
              <Label>Offline</Label>
            )}
          </SidebarCounter>
        </li>
        <li>
          <FieldStyle>{__('Last online')}</FieldStyle>
          <SidebarCounter>
            {dayjs(messengerData.lastSeenAt).format('lll')}
          </SidebarCounter>
        </li>
        <li>
          <FieldStyle>{__('Session count')}</FieldStyle>
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
    const { collapseCallback } = this.props;

    return (
      <Box
        title={__('Messenger data')}
        name="showMessengerData"
        callback={collapseCallback}
      >
        {this.renderContent()}
      </Box>
    );
  }
}

export default MessengerSection;
