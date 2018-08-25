import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { queries as integQueries } from 'modules/settings/integrations/graphql';
import { integrationsListParams } from 'modules/settings/integrations/containers/utils';
import { queries, mutations } from 'modules/settings/integrations/graphql';
import { Form } from 'modules/settings/integrations/components/messenger';

const CreateMessenger = props => {
  const {
    history,
    usersQuery,
    brandsQuery,
    saveMessengerMutation,
    saveConfigsMutation,
    saveAppearanceMutation
  } = props;

  if (usersQuery.loading || brandsQuery.loading) {
    return <Spinner />;
  }

  const users = usersQuery.users || [];
  const brands = brandsQuery.brands || [];

  const save = doc => {
    const { name, brandId, languageCode, messengerData, uiOptions } = doc;
    saveMessengerMutation({
      variables: { name, brandId, languageCode }
    })
      .then(({ data }) => {
        const integrationId = data.integrationsCreateMessengerIntegration._id;

        return saveConfigsMutation({
          variables: { _id: integrationId, messengerData: messengerData }
        });
      })

      .then(({ data }) => {
        const integrationId = data.integrationsSaveMessengerConfigs._id;

        return saveAppearanceMutation({
          variables: { _id: integrationId, uiOptions }
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
    save
  };

  return <Form {...updatedProps} />;
};

CreateMessenger.propTypes = {
  usersQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  saveConfigsMutation: PropTypes.func,
  saveAppearanceMutation: PropTypes.func,
  saveMessengerMutation: PropTypes.func,
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

const CreateMessengerWithData = compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  }),
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.integrationsCreateMessenger), {
    name: 'saveMessengerMutation',
    options: ({ queryParams }) => {
      return {
        refetchQueries: [
          {
            query: gql(integQueries.integrations),
            variables: integrationsListParams(queryParams)
          }
        ]
      };
    }
  }),
  graphql(gql(mutations.integrationsSaveMessengerConfigs), {
    name: 'saveConfigsMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.integrationsSaveMessengerAppearance), {
    name: 'saveAppearanceMutation',
    options: commonOptions
  })
)(CreateMessenger);

export default withRouter(CreateMessengerWithData);
