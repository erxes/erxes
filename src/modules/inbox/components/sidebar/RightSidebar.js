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
  conversation: PropTypes.object,
  customer: PropTypes.object,
  customerId: PropTypes.string,
  refetch: PropTypes.func,
  loading: PropTypes.bool,
  showSectionContent: PropTypes.func,
  queryParams: PropTypes.object
};

class RightSidebar extends Component {
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
    const {
      conversation,
      refetch,
      customer,
      queryParams,
      customerId,
      loading
    } = this.props;

    if (!customerId || !customer._id || customerId !== customer._id) {
      return (
        <Wrapper.Sidebar full>
          <Spinner />
        </Wrapper.Sidebar>
      );
    }

    if (customer._id && conversation._id) {
      return (
        <EditInformation
          conversation={conversation}
          sectionTop={<ConversationDetails conversation={conversation} />}
          sectionBottom={this.renderSectionBottom(customer)}
          customer={customer}
          refetch={refetch}
          queryParams={queryParams}
          otherProperties={this.renderMessengerData()}
        />
      );
    }

    return <Wrapper.Sidebar full>{loading && <Spinner />}</Wrapper.Sidebar>;
  }
}

RightSidebar.propTypes = propTypes;

RightSidebar.childContextTypes = {
  showSectionContent: PropTypes.func,
  queryParams: PropTypes.object
};

export default RightSidebar;
