import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { MessengerConfigs } from '../components';

const MessengerConfigsContainer = props => {
  const { usersQuery, integrationDetailQuery, saveMutation } = props;

  if (integrationDetailQuery.loading || usersQuery.loading) {
    return <Spinner />;
  }

  const users = usersQuery.users;
  const integration = integrationDetailQuery.integrationDetail;

  const messengerData = integration.messengerData;

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
    prevOptions: messengerData || {},
    teamMembers: users || [],
    save
  };

  return <MessengerConfigs {...updatedProps} />;
};

MessengerConfigsContainer.propTypes = {
  integrationDetailQuery: PropTypes.object,
  usersQuery: PropTypes.object,
  saveMutation: PropTypes.func
};

export default compose(
  graphql(
    gql`
      query objects {
        users {
          _id
          details {
            avatar
            fullName
          }
        }
      }
    `,
    {
      name: 'usersQuery'
    }
  ),
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
