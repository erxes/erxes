import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { Alert } from 'modules/common/utils';
import { CustomerForm } from '../components';

const CustomerFormContainer = props => {
  const { customersEdit, customer, customersAdd } = props;

  let action = ({ doc }) => {
    customersAdd({ variables: doc })
      .then(() => {
        Alert.success('Success');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (customer) {
    action = ({ doc }) => {
      customersEdit({ variables: { _id: customer._id, ...doc } })
        .then(() => {
          Alert.success('Success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };
  }

  const updatedProps = {
    ...props,
    action
  };

  return <CustomerForm {...updatedProps} />;
};

CustomerFormContainer.propTypes = {
  customer: PropTypes.object,
  customersEdit: PropTypes.func,
  customersAdd: PropTypes.func
};

CustomerFormContainer.contextTypes = {
  currentUser: PropTypes.object
};

const options = ({ customer }) => {
  if (!customer) {
    return {
      refetchQueries: [
        {
          query: gql(queries.customersMain),
          fetchPolicy: 'network-only'
        }
      ]
    };
  }

  return {
    refetchQueries: [
      {
        query: gql(queries.customerDetail),
        variables: { _id: customer._id },
        fetchPolicy: 'network-only'
      }
    ]
  };
};

export default compose(
  graphql(gql(mutations.customersEdit), {
    name: 'customersEdit',
    options
  }),
  graphql(gql(mutations.customersAdd), {
    name: 'customersAdd',
    options
  })
)(CustomerFormContainer);
