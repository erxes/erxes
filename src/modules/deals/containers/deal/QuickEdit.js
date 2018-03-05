import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { QuickEdit } from '../../components';
import { mutations } from '../../graphql';
import { Alert, confirm } from 'modules/common/utils';

class QickEditDealFormContainer extends React.Component {
  render() {
    const { addMutation, removeMutation } = this.props;

    // remove action
    const remove = (_id, callback) => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            Alert.success('Successfully deleted.');

            callback();
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // create copied one
    const copy = (doc, callback) => {
      addMutation({
        variables: doc
      })
        .then(() => {
          Alert.success('Successfully copied!');

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const extendedProps = {
      ...this.props,
      copy,
      remove
    };

    return <QuickEdit {...extendedProps} />;
  }
}

const propTypes = {
  addMutation: PropTypes.func,
  removeMutation: PropTypes.func
};

QickEditDealFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.dealsRemove), {
    name: 'removeMutation'
  })
)(QickEditDealFormContainer);
