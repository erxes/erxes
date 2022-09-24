import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';

import { IBrand } from '@erxes/ui/src/brands/types';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IField } from '@erxes/ui/src/types';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import IntegrationIcon from '@erxes/ui-inbox/src/settings/integrations/components/IntegrationIcon';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from 'coreui/utils';
import { cleanIntegrationKind } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';

type Props = {
  conversation: IConversation;
  fields: IField[];
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

  renderRow(field, value) {
    const { fields = [] } = this.props;

    const property = fields.find(e => e.type === field);

    if (property && !property.isVisible) {
      return null;
    }

    const label = property && property.text;

    return (
      <li>
        <FieldStyle>{__(`${label}`)}:</FieldStyle>
        <SidebarCounter>{value}</SidebarCounter>
      </li>
    );
  }

  renderIntegration() {
    const { conversation, fields = [] } = this.props;
    const { integration = {} as IIntegration } = conversation;

    const property = fields.find(e => e.type === 'integration');

    if (property && !property.isVisible) {
      return null;
    }

    const label = property && property.text;

    return (
      <li>
        <FieldStyle>{__(`${label}`)}:</FieldStyle>
        <SidebarCounter>
          {cleanIntegrationKind(integration.kind)}
          <IntegrationIcon integration={integration} />
        </SidebarCounter>
      </li>
    );
  }

  render() {
    const { Section } = Sidebar;

    const { conversation, fields } = this.props;
    const { integration = {} as IIntegration, customer } = conversation;
    const { brand = {} as IBrand, channels = [] } = integration;

    if (!fields || fields.length === 0) {
      return null;
    }

    return (
      <Section>
        <div>
          <SidebarList className="no-link">
            {this.renderVisitorContactInfo(customer)}
            {this.renderRow(
              'opened',
              dayjs(conversation.createdAt).format('lll')
            )}
            {this.renderRow(
              'channels',
              channels.map(c => <span key={c._id}>{c.name} </span>)
            )}
            {this.renderRow('brand', brand && brand.name)}
            {this.renderIntegration()}
            {this.renderRow('count', conversation.messageCount)}
          </SidebarList>
        </div>
      </Section>
    );
  }
}

export default ConversationDetails;
