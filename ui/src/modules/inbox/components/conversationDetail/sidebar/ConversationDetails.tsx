import dayjs from 'dayjs';
import IntegrationIcon from 'modules/common/components/IntegrationIcon';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from 'modules/layout/styles';
import { cleanIntegrationKind } from 'modules/settings/integrations/containers/utils';
import React from 'react';
import { ICustomer } from '../../../../customers/types';
import { IBrand } from '../../../../settings/brands/types';
import { IIntegration } from '../../../../settings/integrations/types';
import { IConversation } from '../../../types';

type Props = {
  conversation: IConversation;
};

class ConversationDetails extends React.Component<Props> {
  renderVisitorContactInfo(customer: ICustomer) {
    if (!customer) {
      return null;
    }

    const { visitorContactInfo } = customer;

    if (!visitorContactInfo) {
      return null;
    }

    return (
      <li>
        <FieldStyle>{__('Visitor contact info')}</FieldStyle>
        <SidebarCounter>
          {visitorContactInfo.email || visitorContactInfo.phone}
        </SidebarCounter>
      </li>
    );
  }

  render() {
    const { Section } = Sidebar;

    const { conversation } = this.props;
    const { integration = {} as IIntegration, customer } = conversation;
    const { brand = {} as IBrand, channels = [] } = integration;

    return (
      <Section>
        <div>
          <SidebarList className="no-link">
            {this.renderVisitorContactInfo(customer)}
            <li>
              <FieldStyle>{__('Opened')}</FieldStyle>
              <SidebarCounter>
                {dayjs(conversation.createdAt).format('lll')}
              </SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('Channels')}</FieldStyle>
              <SidebarCounter>
                {channels.map(c => (
                  <span key={c._id}>{c.name} </span>
                ))}
              </SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('Brand')}</FieldStyle>
              <SidebarCounter>{brand && brand.name}</SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('Integration')}</FieldStyle>
              <SidebarCounter>
                {cleanIntegrationKind(integration.kind)}
                <IntegrationIcon integration={integration} />
              </SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('Conversations')}</FieldStyle>
              <SidebarCounter>{conversation.messageCount}</SidebarCounter>
            </li>
          </SidebarList>
        </div>
      </Section>
    );
  }
}

export default ConversationDetails;
