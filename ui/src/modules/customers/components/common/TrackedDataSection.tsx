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

class TrackedDataSection extends React.Component<Props> {
  renderCustomValue = (value: string) => {
    if (isValidDate(value) || isTimeStamp(value)) {
      return dayjs(value).format('lll');
    }

    return value;
  };

  renderContent() {
    const { customer } = this.props;
    const { isOnline, sessionCount, lastSeenAt } = customer;

    const trackedData = customer.getTrackedData || [];

    if (!trackedData) {
      return <EmptyState icon="chat" text="Empty" size="small" />;
    }

    return (
      <SidebarList className="no-link">
        <li>
          <FieldStyle>{__('Status')}</FieldStyle>
          <SidebarCounter>
            {isOnline ? (
              <Label lblStyle="success">Online</Label>
            ) : (
              <Label lblStyle="simple">Offline</Label>
            )}
          </SidebarCounter>
        </li>
        <li>
          <FieldStyle>{__('Last online')}</FieldStyle>
          <SidebarCounter>{dayjs(lastSeenAt).format('lll')}</SidebarCounter>
        </li>
        <li>
          <FieldStyle>{__('Session count')}</FieldStyle>
          <SidebarCounter>{sessionCount}</SidebarCounter>
        </li>
        {trackedData.map((data, index) => (
          <li key={index}>
            <FieldStyle>{data.name}</FieldStyle>
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
        title={__('Tracked data')}
        name="showTrackedData"
        callback={collapseCallback}
      >
        {this.renderContent()}
      </Box>
    );
  }
}

export default TrackedDataSection;
