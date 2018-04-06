import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from 'modules/customers/graphql';
import { BasicInfo } from 'modules/customers/components/detail/sidebar';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router-dom';

const BasicInfoContainer = props => {
  const { customer, customersRemove, customersMerge, history } = props;

  const { _id } = customer;

  const remove = () => {
    customersRemove({
      variables: { customerIds: [_id] }
    })
      .then(() => {
        Alert.success('Success');
        history.push(`/customers?updated`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const merge = ({ targetId, data }) => {
    customersMerge({
      variables: {
        customerIds: [_id, targetId],
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

  return <BasicInfo {...updatedProps} />;
};

BasicInfoContainer.propTypes = {
  customer: PropTypes.object.isRequired,
  customersRemove: PropTypes.func,
  customersMerge: PropTypes.func,
  history: PropTypes.object.isRequired
};

BasicInfoContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default compose(
  // mutations
  graphql(gql(mutations.customersRemove), {
    name: 'customersRemove'
  }),
  graphql(gql(mutations.customersMerge), {
    name: 'customersMerge'
  })
)(withRouter(BasicInfoContainer));
