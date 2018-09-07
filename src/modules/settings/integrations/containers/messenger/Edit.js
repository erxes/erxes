import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from 'modules/settings/integrations/graphql';
import { Form } from 'modules/settings/integrations/components/messenger';

const EditMessenger = props => {
  const {
    history,
    integrationId,
    usersQuery,
    brandsQuery,
    integrationDetailQuery,
    editMessengerMutation,
    saveConfigsMutation,
    saveAppearanceMutation
  } = props;

  if (
    integrationDetailQuery.loading ||
    usersQuery.loading ||
    brandsQuery.loading
  ) {
    return <Spinner />;
  }

  const users = usersQuery.users || [];
  const brands = brandsQuery.brands || [];
  const integration = integrationDetailQuery.integrationDetail || {};

  const save = doc => {
    const { name, brandId, languageCode, messengerData, uiOptions } = doc;
    editMessengerMutation({
      variables: { _id: integrationId, name, brandId, languageCode }
    })
      .then(({ data }) => {
        const id = data.integrationsEditMessengerIntegration._id;

        return saveConfigsMutation({
          variables: { _id: id, messengerData: messengerData }
        });
      })

      .then(({ data }) => {
        const id = data.integrationsSaveMessengerConfigs._id;

        return saveAppearanceMutation({
          variables: { _id: id, uiOptions }
        });
      })

      .then(() => {
        Alert.success('Successfully saved.');
        history.push('/settings/integrations?refetch=true');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    teamMembers: users || [],
    brands,
    save,
    integration
  };

  return <Form {...updatedProps} />;
};

EditMessenger.propTypes = {
  usersQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  integrationId: PropTypes.string,
  integrationDetailQuery: PropTypes.object,
  saveConfigsMutation: PropTypes.func,
  saveAppearanceMutation: PropTypes.func,
  editMessengerMutation: PropTypes.func,
  history: PropTypes.object
};

const commonOptions = ({ queryParams, integrationId }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.integrationDetail),
        variables: { _id: integrationId || '' },
        fetchPolicy: 'network-only'
      }
    ]
  };
};

const EditMessengerWithData = compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  }),
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationDetail), {
    name: 'integrationDetailQuery',
    options: ({ integrationId }) => ({
      variables: {
        _id: integrationId || ''
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.integrationsEditMessenger), {
    name: 'editMessengerMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.integrationsSaveMessengerConfigs), {
    name: 'saveConfigsMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.integrationsSaveMessengerAppearance), {
    name: 'saveAppearanceMutation',
    options: commonOptions
  })
)(EditMessenger);

export default withRouter(EditMessengerWithData);
