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
    customersEdit,
    fieldsGroupsQuery,
    customerDetailQuery,
    wide
  } = props;

  if (fieldsGroupsQuery.loading || customerDetailQuery.loading) {
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

  const updatedProps = {
    ...props,
    save,
    customer: customerDetailQuery.customerDetail || {},
    customFieldsData: customerDetailQuery.customerDetail.customFieldsData || {},
    currentUser: context.currentUser,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <EditInformation {...updatedProps} />;
};

EditInformationContainer.propTypes = {
  customerId: PropTypes.string.isRequired,
  sections: PropTypes.node,
  customersEdit: PropTypes.func.isRequired,
  wide: PropTypes.bool,
  fieldsGroupsQuery: PropTypes.object.isRequired,
  customerDetailQuery: PropTypes.object.isRequired,
  query: PropTypes.object
};

EditInformationContainer.contextTypes = {
  currentUser: PropTypes.object
};

const options = ({ customerId }) => ({
  refetchQueries: [
    {
      query: gql`
        ${queries.customerDetail}
      `,
      variables: { _id: customerId }
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
