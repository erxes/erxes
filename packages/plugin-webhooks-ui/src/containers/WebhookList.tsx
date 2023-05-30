import { gql } from '@apollo/client';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import {
  ICommonFormProps,
  ICommonListProps
} from '@erxes/ui-settings/src/common/types';
import { queries as generalQueries } from '@erxes/ui-settings/src/general/graphql';

import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { commonListComposer } from '@erxes/ui/src/utils';
import WebhookList from '../components/WebhookList';
import { mutations, queries } from '../graphql';

type Props = ICommonListProps &
  ICommonFormProps & {
    removeMutation: any;
    listQuery: any;
    editMutation: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
  };

class WebhookListContainer extends React.Component<Props> {
  render() {
    return (
      <WebhookList
        {...this.props}
        refetchQueries={getRefetchQueries()}
        renderButton={this.props.renderButton}
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
      _id: queryParams._id
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
  gqlGetActionsQuery: graphql(gql(queries.webhooksGetActions), {
    name: 'webhooksGetActionsQuery'
  }),
  gqlAddMutation: graphql(gql(mutations.webhooksAdd), {
    name: 'addMutation'
  }),
  gqlEditMutation: graphql(gql(mutations.webhooksEdit), {
    name: 'editMutation'
  }),
  gqlRemoveMutation: graphql(gql(mutations.webhooksRemove), {
    name: 'removeMutation'
  }),
  gqlTotalCountQuery: graphql(gql(queries.webhooksTotalCount), {
    name: 'totalCountQuery',
    options
  }),

  ListComponent: WebhookListContainer,
  gqlConfigsQuery: graphql(gql(generalQueries.configsGetEnv), {
    name: 'configsEnvQuery',
    options: { fetchPolicy: 'network-only' }
  })
});
