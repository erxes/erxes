import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Loading } from 'modules/common/components';
import { MessengerConfigs } from '../components';

const MessengerConfigsContainer = props => {
  const { integrationDetailQuery, saveMutation } = props;

  if (integrationDetailQuery.loading) {
    return <Loading title="Integrations" spin />;
  }

  const integration = integrationDetailQuery.integrationDetail;

  const save = doc => {
    saveMutation({
      variables: { _id: integration._id, messengerData: doc }
    })
      .then(() => {
        Alert.success('Successfully saved.');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    prevOptions: integration.messengerData || {},
    save,
    // TODO
    user: {}
  };

  return <MessengerConfigs {...updatedProps} />;
};

MessengerConfigsContainer.propTypes = {
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
          messengerData
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
      mutation save($_id: String!, $messengerData: IntegrationMessengerData) {
        integrationsSaveMessengerConfigs(
          _id: $_id
          messengerData: $messengerData
        ) {
          _id
        }
      }
    `,
    {
      name: 'saveMutation'
    }
  )
)(MessengerConfigsContainer);
