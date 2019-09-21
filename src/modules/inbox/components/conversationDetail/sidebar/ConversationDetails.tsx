import dayjs from 'dayjs';
import IntegrationIcon from 'modules/common/components/IntegrationIcon';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import {
  SectionBody,
  SidebarCounter,
  SidebarList
} from 'modules/layout/styles';
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
    const { visitorContactInfo } = customer;

    if (!visitorContactInfo) {
      return null;
    }

    return (
      <li>
        {__('Visitor contact info')}
        <SidebarCounter>
          {visitorContactInfo.email || visitorContactInfo.phone}
        </SidebarCounter>
      </li>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { conversation } = this.props;
    const { integration = {} as IIntegration, customer } = conversation;
    const { brand = {} as IBrand, channels = [] } = integration;

    return (
      <Section>
        <Title>{__('Conversation Details')}</Title>

        <SectionBody>
          <SidebarList className="no-link">
            {this.renderVisitorContactInfo(customer)}
            <li>
              {__('Opened')}
              <SidebarCounter>
                {dayjs(conversation.createdAt).format('lll')}
              </SidebarCounter>
            </li>
            <li>
              {__('Channels')}
              <SidebarCounter>
                {channels.map(c => (
                  <span key={c._id}>{c.name} </span>
                ))}
              </SidebarCounter>
            </li>
            <li>
              {__('Brand')}
              <SidebarCounter>{brand && brand.name}</SidebarCounter>
            </li>
            <li>
              {__('Integration')}
              <SidebarCounter>
                {integration.kind}
                <IntegrationIcon integration={integration} />
              </SidebarCounter>
            </li>
            <li>
              {__('Conversations')}
              <SidebarCounter>{conversation.messageCount}</SidebarCounter>
            </li>
          </SidebarList>
        </SectionBody>
      </Section>
    );
  }
}

export default ConversationDetails;
