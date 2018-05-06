import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { SidebarCounter } from 'modules/layout/styles';
import { Wrapper } from 'modules/layout/components';
import ConversationDetails from './ConversationDetails';
import { EditInformation } from 'modules/customers/containers';
import { CompanyAssociate } from 'modules/companies/containers';
import { DealSection } from 'modules/deals/containers';
import { Spinner } from 'modules/common/components';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  customer: PropTypes.object,
  refetch: PropTypes.func,
  loading: PropTypes.bool,
  showSectionContent: PropTypes.func
};

class RightSidebar extends Component {
  getChildContext() {
    return { showSectionContent: this.props.showSectionContent };
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
    return (
      <Fragment>
        <CompanyAssociate data={customer} />
        <DealSection customerId={customer._id} />
      </Fragment>
    );
  }

  render() {
    const { loading, conversation, refetch, customer } = this.props;

    if (customer && conversation) {
      return (
        <EditInformation
          conversation={conversation}
          sectionTop={<ConversationDetails conversation={conversation} />}
          sectionBottom={this.renderSectionBottom(customer)}
          customer={customer}
          refetch={refetch}
          otherProperties={this.renderMessengerData()}
        />
      );
    }

    return <Wrapper.Sidebar full>{loading && <Spinner />}</Wrapper.Sidebar>;
  }
}

RightSidebar.propTypes = propTypes;

RightSidebar.childContextTypes = {
  showSectionContent: PropTypes.func
};

export default RightSidebar;
