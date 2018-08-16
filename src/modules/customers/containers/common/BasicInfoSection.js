import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { BasicInfoSection } from 'modules/customers/components/common';
import { queries, mutations } from 'modules/customers/graphql';
import { generateListQueryVariables } from 'modules/customers/utils';

const BasicInfoContainer = props => {
  const { customer, customersRemove, customersMerge, history } = props;

  const { _id } = customer;

  const remove = () => {
    customersRemove({
      variables: { customerIds: [_id] }
    })
      .then(() => {
        Alert.success('Success');
        history.push('/customers');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const merge = ({ ids, data }) => {
    customersMerge({
      variables: {
        customerIds: ids,
        customerFields: data
      }
    })
      .then(data => {
        Alert.success('Success');
        history.push(`/customers/details/${data.data.customersMerge._id}`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
    merge
  };

  return <BasicInfoSection {...updatedProps} />;
};

BasicInfoContainer.propTypes = {
  customer: PropTypes.object.isRequired,
  customersRemove: PropTypes.func,
  customersMerge: PropTypes.func,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

BasicInfoContainer.contextTypes = {
  currentUser: PropTypes.object
};

const generateOptions = () => ({
  refetchQueries: [
    {
      query: gql(queries.customersMain),
      variables: generateListQueryVariables({ queryParams: {} })
    },
    {
      query: gql(queries.customerCounts),
      variables: generateListQueryVariables({ queryParams: {} })
    }
  ]
});

export default withRouter(
  compose(
    // mutations
    graphql(gql(mutations.customersRemove), {
      name: 'customersRemove',
      options: generateOptions()
    }),
    graphql(gql(mutations.customersMerge), {
      name: 'customersMerge',
      options: generateOptions()
    })
  )(BasicInfoContainer)
);
