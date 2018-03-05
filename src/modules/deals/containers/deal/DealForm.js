import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { DealForm } from '../../components';
import { queries, mutations } from '../../graphql';

class DealFormContainer extends React.Component {
  render() {
    const { usersQuery, addMutation, editMutation } = this.props;

    const users = usersQuery.users || [];

    // create or update action
    const save = ({ doc }, callback, deal) => {
      let mutation = addMutation;
      // if edit mode
      if (deal) {
        mutation = editMutation;
        doc._id = deal._id;
      }

      mutation({
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
      save
    };

    return <DealForm {...extendedProps} />;
  }
}

const propTypes = {
  usersQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func
};

DealFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  }),
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.dealsEdit), {
    name: 'editMutation'
  })
)(DealFormContainer);
