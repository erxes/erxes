import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { QuickEditDealForm } from '../components';
import { mutations } from '../graphql';
import { Alert, confirm } from 'modules/common/utils';

class QickEditDealFormContainer extends React.Component {
  render() {
    const { removeMutation } = this.props;

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

    const extendedProps = {
      ...this.props,
      remove
    };

    return <QuickEditDealForm {...extendedProps} />;
  }
}

const propTypes = {
  removeMutation: PropTypes.func
};

QickEditDealFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(mutations.dealsRemove), {
    name: 'removeMutation'
  })
)(QickEditDealFormContainer);
