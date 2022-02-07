import dayjs from 'dayjs';
import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Label from '@erxes/ui/src/components/Label';
import { __, isValidDate } from '@erxes/ui/src/utils';
import { ICompany } from '@erxes/ui/src/companies/types';
import { FieldStyle, SidebarCounter, SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { ICustomer } from '../../types';

type Props = {
  customer?: ICustomer;
  company?: ICompany;
  queryParams?: any;
  collapseCallback?: () => void;
};

class TrackedDataSection extends React.Component<Props> {
  renderCustomValue = (value: string) => {
    if (isValidDate(value)) {
      return dayjs(value).format('lll');
    }

    return value;
  };

  renderTrackedData(trackedData: any[]) {
    return (
      <>
        {trackedData.map((data, index) => (
          <li key={index}>
            <FieldStyle>{data.field}</FieldStyle>
            <SidebarCounter>
              {this.renderCustomValue(data.value)}
            </SidebarCounter>
          </li>
        ))}
      </>
    );
  }

  renderContent() {
    const { customer, company } = this.props;

    if (company) {
      return (
        <SidebarList className="no-link">
          {this.renderTrackedData(company.trackedData || [])}
        </SidebarList>
      );
    }

    if (!customer) {
      return null;
    }

    const { isOnline, sessionCount, lastSeenAt } = customer;

    const trackedData = customer.trackedData || [];
    
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
        {this.renderTrackedData(trackedData)}
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
