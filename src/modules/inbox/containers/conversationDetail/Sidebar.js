import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Sidebar as DumbSidebar } from 'modules/inbox/components/conversationDetail';
import { queries as customerQueries } from 'modules/customers/graphql';
import client from 'apolloClient';

const STORAGE_KEY = `erxes_sidebar_section_config`;

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = { customer: {}, loading: false };
    this.showSectionContent = this.showSectionContent.bind(this);
  }

  componentDidMount() {
    this.getCustomerDetail(this.props.conversation.customerId);
  }

  componentWillReceiveProps(nextProps) {
    const current = this.props.conversation.customerId;
    const next = nextProps.conversation.customerId;

    if (current !== next) {
      this.getCustomerDetail(next);
    }
  }

  getCustomerDetail(customerId) {
    const sectionParams = this.getSectionParams();

    this.setState({ loading: true });

    client
      .query({
        query: gql(customerQueries.generateCustomerDetailQuery(sectionParams)),
        fetchPolicy: 'network-only',
        variables: { _id: customerId }
      })
      .then(({ data }) => {
        if (data && data.customerDetail) {
          this.setState({ customer: data.customerDetail, loading: false });
        }
      })
      .catch(error => {
        console.log(error.message); //eslint-disable-line
      });
  }

  getSectionParams() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  }

  setSectionParams(params) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }

  showSectionContent(isUseCustomer, obj) {
    const { name, val } = obj;
    const sectionParams = this.getSectionParams();

    sectionParams[name] = val;

    this.setSectionParams(sectionParams);

    isUseCustomer && this.getCustomerDetail();
  }

  render() {
    const { customer, loading } = this.state;

    if (!localStorage.getItem(STORAGE_KEY)) {
      this.setSectionParams({
        showProfile: true,
        showCompany: false,
        showConversationDetail: false,
        showManageGroups: false,
        showDeal: false,
        showDeviceProperty: false,
        showMessenger: false,
        showFacebook: false,
        showTwitter: false,
        showTags: false,
        showOtherProperty: false
      });
    }

    const updatedProps = {
      ...this.props,
      customer,
      loading,
      showSectionContent: this.showSectionContent,
      queryParams: this.getSectionParams()
    };

    return <DumbSidebar {...updatedProps} />;
  }
}

Sidebar.propTypes = {
  conversation: PropTypes.object.isRequired
};

export default Sidebar;
