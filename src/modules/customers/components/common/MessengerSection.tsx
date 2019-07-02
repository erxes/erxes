import { EmptyState, Label } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import moment from 'moment';
import React from 'react';
import { ICustomer } from '../../types';

type Props = {
  customer: ICustomer;
  // TODO: check query params. Because it was in context
  queryParams?: any;
};

class MessengerSection extends React.Component<Props> {
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
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section>
        <Title>{__('Messenger data')}</Title>

        {this.renderContent()}
      </Section>
    );
  }
}

export default MessengerSection;
