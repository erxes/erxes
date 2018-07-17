import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Sidebar as DumbSidebar } from 'modules/inbox/components/conversationDetail';
import { queries as customerQueries } from 'modules/customers/graphql';
import client from 'apolloClient';

const STORAGE_KEY = `erxes_sidebar_section_config`;

const getSectionParams = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
};

const setSectionParams = params => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
};

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
    const currentDetail = this.props.customerDetailQuery;
    const nextDetail = nextProps.customerDetailQuery;

    const current = currentDetail.customerDetail || {};
    const next = nextDetail.customerDetail || {};

    if (JSON.stringify(current) !== JSON.stringify(next)) {
      this.getCustomerDetail(next._id);
    }
  }

  getCustomerDetail(customerId) {
    const sectionParams = getSectionParams();

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

  showSectionContent(isUseCustomer, section) {
    const customerId = this.props.conversation.customerId;
    const { name, val } = section;
    const sectionParams = getSectionParams();

    sectionParams[name] = val;

    setSectionParams(sectionParams);

    isUseCustomer && this.getCustomerDetail(customerId);
  }

  render() {
    const { customer, loading } = this.state;

    if (!localStorage.getItem(STORAGE_KEY)) {
      setSectionParams({
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
      queryParams: getSectionParams()
    };

    return <DumbSidebar {...updatedProps} />;
  }
}

Sidebar.propTypes = {
  conversation: PropTypes.object.isRequired,
  customerDetailQuery: PropTypes.object.isRequired
};

export default compose(
  graphql(
    gql(customerQueries.generateCustomerDetailQuery(getSectionParams())),
    {
      name: 'customerDetailQuery',
      options: ({ conversation }) => ({
        variables: {
          _id: conversation.customerId
        }
      })
    }
  )
)(Sidebar);
