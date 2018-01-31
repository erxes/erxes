import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { MessengerAppearance } from '../components';

const MessengerAppearanceContainer = props => {
  const { integrationDetailQuery, saveMutation } = props;

  if (integrationDetailQuery.loading) {
    return <Spinner />;
  }

  const integration = integrationDetailQuery.integrationDetail;

  const save = uiOptions => {
    saveMutation({ variables: { _id: integration._id, uiOptions } })
      .then(() => {
        Alert.success('Successfully saved.');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    prevOptions: integration.uiOptions || {},
    save,
    // TODO
    user: {}
  };

  return <MessengerAppearance {...updatedProps} />;
};

MessengerAppearanceContainer.propTypes = {
  integrationDetailQuery: PropTypes.object,
  saveMutation: PropTypes.func
};

export default compose(
  graphql(
    gql`
      query integrationDetail($_id: String!) {
        integrationDetail(_id: $_id) {
          _id
          name
          uiOptions
        }
      }
    `,
    {
      name: 'integrationDetailQuery',
      options: ({ integrationId }) => ({
        variables: {
          _id: integrationId
        },
        fetchPolicy: 'network-only'
      })
    }
  ),
  graphql(
    gql`
      mutation save($_id: String!, $uiOptions: MessengerUiOptions) {
        integrationsSaveMessengerAppearanceData(
          _id: $_id
          uiOptions: $uiOptions
        ) {
          _id
        }
      }
    `,
    {
      name: 'saveMutation'
    }
  )
)(MessengerAppearanceContainer);
