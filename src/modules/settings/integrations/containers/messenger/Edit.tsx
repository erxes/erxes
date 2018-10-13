import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert } from 'modules/common/utils';
import { Form } from 'modules/settings/integrations/components/messenger';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import {
  IMessengerData,
  IUiOptions
} from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';

interface IProps extends IRouterProps {
  usersQuery: any;
  brandsQuery: any;
  integrationId: string;
  integrationDetailQuery: any;
  saveConfigsMutation: (
    params: { variables: { _id: string; messengerData: IMessengerData } }
  ) => any;
  saveAppearanceMutation: (
    params: { variables: { _id: string; uiOptions: IUiOptions } }
  ) => void;
  editMessengerMutation: (
    params: {
      variables: {
        _id: string;
        name: string;
        brandId: string;
        languageCode: string;
      };
    }
  ) => any;
}

const EditMessenger = (props: IProps) => {
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
          variables: { _id: id, messengerData }
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
    options: ({ integrationId }: { integrationId: string }) => ({
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

export default withRouter<IProps>(EditMessengerWithData);
