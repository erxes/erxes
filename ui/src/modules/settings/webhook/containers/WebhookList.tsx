// import client from 'apolloClient';
import gql from 'graphql-tag';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, confirm } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import {
  ICommonFormProps,
  ICommonListProps
} from 'modules/settings/common/types';
import { queries as generalQueries } from 'modules/settings/general/graphql';
// import { queries as permissionQueries } from 'modules/settings/permissions/graphql';

import React from 'react';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import WebhookList from '../components/WebhookList';
import { mutations, queries } from '../graphql';

type Props = ICommonListProps &
  ICommonFormProps & {
    removeMutation: any;
    listQuery: any;
    editMutation: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
  };

class WebhookListContainer extends React.Component<
  Props
  > {
  constructor(props) {
    super(props);
  }

  editWebhook = webhook => {
    const { editMutation } = this.props;

    console.log('editing: ',webhook)

    Alert.warning('Saving... Please wait!!!');

    editMutation({ variables: { _id: webhook._id, url: webhook.url, actions: webhook.actions } })
      .then(() => {
        Alert.success('Webhook has been edited.');
        getRefetchQueries()
      })

      .catch(error => {
        Alert.error(error.message);
      });

  }

  removeWebhook = webhook => {
    const { removeMutation } = this.props;
    const message =
      `Are you sure you want to delete the webhook pointing to ${webhook.url}`;

    confirm(message).then(() => {
      Alert.warning('Removing... Please wait!!!');

      removeMutation({ variables: { ids: [webhook._id] } })
        .then(() => {
          Alert.success('Your webhook is no longer in this list');
          getRefetchQueries()
        })

        .catch(error => {
          Alert.error(error.message);
        });
    });
  };


  render() {
    return (
      <WebhookList
        {...this.props}
        refetchQueries={getRefetchQueries()}
        renderButton={this.props.renderButton}
        removeWebhook={this.removeWebhook}
        editWebhook={this.editWebhook}
        objects={this.props.listQuery.webhooks || []}
      />
    );
  }
}

const getRefetchQueries = () => {
  return [
    { query: gql(queries.webhooks), options },
    { query: gql(queries.webhooksTotalCount), options }
  ];
};

const options = ({ queryParams }: { queryParams: any }): any => {
  return {
    variables: {
      ...generatePaginationParams(queryParams),
      _id: queryParams._id,
      isOutgoing: queryParams.isOutgoing === 'false' ? false : true,
    },
    fetchPolicy: 'network-only'
  };
};



export default commonListComposer<{ queryParams: any; history: any }>({
  text: 'webhook',
  label: 'webhooks',
  stringAddMutation: mutations.webhooksAdd,
  stringEditMutation: mutations.webhooksEdit,

  gqlListQuery: graphql(gql(queries.webhooks), {
    name: 'listQuery',
    options
  }),
  gqlAddMutation: graphql(gql(mutations.webhooksAdd), {
    name: 'addMutation'
  }),
  gqlEditMutation: graphql(gql(mutations.webhooksEdit), {
    name: 'editMutation'
  }),
  gqlRemoveMutation: graphql(gql(mutations.webhooksRemove), {
    name: 'removeMutation',
  }),
  gqlTotalCountQuery: graphql(gql(queries.webhooksTotalCount), {
    name: 'totalCountQuery',
    options
  }),

  ListComponent: WebhookListContainer,
  gqlConfigsQuery: graphql(gql(generalQueries.configsGetEnv), {
    name: 'configsEnvQuery',
    options: { fetchPolicy: 'network-only' }
  }),
});
