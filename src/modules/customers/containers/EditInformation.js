import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries, mutations } from '../graphql';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { EditInformation } from '../components/detail/sidebar';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';

const EditInformationContainer = (props, context) => {
  const {
    customerId,
    customer,
    customersEdit,
    fieldsGroupsQuery,
    customerDetailQuery,
    wide
  } = props;

  const customerDetailQueryLoading = customerId
    ? customerDetailQuery.loading
    : false;

  if (fieldsGroupsQuery.loading || customerDetailQueryLoading) {
    return (
      <Sidebar full wide={wide}>
        <Spinner />
      </Sidebar>
    );
  }

  const save = (variables, callback) => {
    customersEdit({
      variables: { customerId, ...variables }
    })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const customerDetail = customer || {};
  const customFieldsData = customerDetail.customFieldsData || {};

  const updatedProps = {
    ...props,
    save,
    customer: customerId ? customerDetailQuery.customerDetail : customerDetail,
    customFieldsData: customerId
      ? customerDetailQuery.customerDetail.customFieldsData
      : customFieldsData,
    currentUser: context.currentUser,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <EditInformation {...updatedProps} />;
};

EditInformationContainer.propTypes = {
  customerId: PropTypes.string,
  sections: PropTypes.node,
  customersEdit: PropTypes.func.isRequired,
  wide: PropTypes.bool,
  customer: PropTypes.object,
  fieldsGroupsQuery: PropTypes.object.isRequired,
  customerDetailQuery: PropTypes.object,
  query: PropTypes.object
};

EditInformationContainer.contextTypes = {
  currentUser: PropTypes.object
};

const options = ({ customerId, customer }) => ({
  refetchQueries: [
    {
      query: gql`
        ${queries.customerDetail}
      `,
      variables: { _id: customerId || customer._id }
    }
  ]
});

export default compose(
  graphql(gql(fieldQueries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: () => ({
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER
      }
    })
  }),
  graphql(gql(queries.customerDetail), {
    name: 'customerDetailQuery',
    skip: ({ customerId }) => (customerId ? false : true),
    options: ({ customerId }) => ({
      variables: {
        _id: customerId
      }
    })
  }),
  // mutations
  graphql(gql(mutations.customersEdit), {
    name: 'customersEdit',
    options
  })
)(EditInformationContainer);
