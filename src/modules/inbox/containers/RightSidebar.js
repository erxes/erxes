import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { RightSidebar as RightSidebarComponent } from '../components';
import { queries as customerQueries } from 'modules/customers/graphql';
import client from 'apolloClient';
const storageKey = `erxes_sidebar_section_config`;

class RightSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = { customer: {}, loading: false };
    this.showSectionContent = this.showSectionContent.bind(this);
  }

  componentWillReceiveProps() {
    this.getCustomerDetail();
  }

  getCustomerDetail() {
    const { customerId } = this.props;

    if (!customerId) return;

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
          this.setState({
            customer: data.customerDetail,
            loading: false
          });
        }
      })
      .catch(error => {
        console.log(error.message); //eslint-disable-line
      });
  }

  getSectionParams() {
    return JSON.parse(localStorage.getItem(storageKey));
  }

  setSectionParams(params) {
    localStorage.setItem(storageKey, JSON.stringify(params));
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

    if (!localStorage.getItem(storageKey)) {
      this.setSectionParams({
        showProfile: false,
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

    return <RightSidebarComponent {...updatedProps} />;
  }
}

RightSidebar.propTypes = {
  customerDetailQuery: PropTypes.object,
  customerId: PropTypes.string.isRequired,
  conversation: PropTypes.object.isRequired,
  refetch: PropTypes.func
};

export default RightSidebar;
