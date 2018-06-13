import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ConversationDetails from './ConversationDetails';
import { EditInformation } from 'modules/customers/containers';
import { CompanyAssociate } from 'modules/companies/containers';
import { DealSection } from 'modules/deals/containers';
import { SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  conversation: PropTypes.object,
  customer: PropTypes.object,
  refetch: PropTypes.func,
  showSectionContent: PropTypes.func,
  queryParams: PropTypes.object
};

class Sidebar extends Component {
  shouldComponentUpdate(nextProps) {
    const current = this.props.conversation;
    const next = nextProps.conversation;

    return current._id !== next._id;
  }

  getChildContext() {
    const { showSectionContent, queryParams } = this.props;

    return { showSectionContent, queryParams };
  }

  renderMessengerData() {
    const { conversation } = this.props;
    const customer = conversation.customer || {};
    const integration = conversation.integration || {};
    const customData = customer.getMessengerCustomData;

    if (integration.kind === 'messenger' && customData.length) {
      return customData.map(data => (
        <li key={data.value}>
          {data.name}
          <SidebarCounter>{data.value}</SidebarCounter>
        </li>
      ));
    }

    return null;
  }

  renderSectionBottom(customer) {
    const { showDeal } = this.props.queryParams;

    return (
      <Fragment>
        <CompanyAssociate data={customer} />
        <DealSection customerId={showDeal ? customer._id : null} />
      </Fragment>
    );
  }

  render() {
    const { conversation, refetch, customer, queryParams } = this.props;

    return (
      <EditInformation
        sectionTop={<ConversationDetails conversation={conversation} />}
        sectionBottom={this.renderSectionBottom(customer)}
        customer={customer}
        refetch={refetch}
        queryParams={queryParams}
        otherProperties={this.renderMessengerData()}
      />
    );
  }
}

Sidebar.propTypes = propTypes;

Sidebar.childContextTypes = {
  showSectionContent: PropTypes.func,
  queryParams: PropTypes.object
};

export default Sidebar;
