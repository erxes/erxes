import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { DealForm } from '../components';
import { queries, mutations } from '../graphql';

class DealFormContainer extends React.Component {
  render() {
    const { usersQuery, addDealMutation } = this.props;

    const users = usersQuery.users || [];

    // create action
    const addDeal = ({ doc }, callback) => {
      addDealMutation({
        variables: doc
      })
        .then(() => {
          Alert.success('Successfully saved!');

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const extendedProps = {
      ...this.props,
      users,
      addDeal
    };

    return <DealForm {...extendedProps} />;
  }
}

const propTypes = {
  usersQuery: PropTypes.object,
  addDealMutation: PropTypes.func
};

DealFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  }),
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addDealMutation'
  })
)(DealFormContainer);
