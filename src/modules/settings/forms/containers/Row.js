import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Row } from '../components';

const RowContainer = props => {
  const { refetch, duplicateMutation } = props;

  const duplicateForm = _id => {
    duplicateMutation({ variables: { _id } })
      .then(() => {
        Alert.success('Congrats');
        refetch();
      })
      .catch(error => {
        Alert.success(error.message);
      });
  };

  const updatedProps = {
    ...props,
    duplicateForm
  };

  return <Row {...updatedProps} />;
};

RowContainer.propTypes = {
  duplicateMutation: PropTypes.func,
  refetch: PropTypes.func
};

export default compose(
  graphql(
    gql`
      mutation formsDuplicate($_id: String!) {
        formsDuplicate(_id: $_id) {
          _id
        }
      }
    `,
    {
      name: 'duplicateMutation'
    }
  )
)(RowContainer);
