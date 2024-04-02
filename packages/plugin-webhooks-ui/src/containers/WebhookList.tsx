import React from 'react';

import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';

import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import {
  ICommonFormProps,
  ICommonListProps,
} from '@erxes/ui-settings/src/common/types';
import { queries as generalQueries } from '@erxes/ui-settings/src/general/graphql';
import { Alert } from '@erxes/ui/src/utils';

import WebhookList from '../components/WebhookList';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
} & ICommonListProps &
  ICommonFormProps;

const WebhookListContainer = (props: Props) => {
  const { queryParams } = props;

  // Queries
  const listQuery = useQuery(
    gql(queries.webhooks),
    options({ queryParams: queryParams || {} }),
  );

  const configsEnvQuery = useQuery(
    gql(generalQueries.configsGetEnv),
    options({ queryParams: queryParams || {} }),
  );

  const totalCountQuery = useQuery(
    gql(queries.webhooksTotalCount),
    options({ queryParams: queryParams || {} }),
  );

  // Mutations
  const [webhooksRemove] = useMutation(gql(mutations.webhooksRemove), {
    refetchQueries: ['webhooks', 'webhooksTotalCount'],
  });

  const removeWebhook = (_id: any) => {
    webhooksRemove({ variables: { _id } })
      .then(() => {
        Alert.success('You successfully updated a census');
      })
      .catch((error: any) => Alert.error(error.message));
  };

  // Definition
  const updatedProps = {
    ...props,
    objects: listQuery?.data?.webhooks || [],
    configsEnvQuery: configsEnvQuery?.data?.configsGetEnv || {},
    totalCount: totalCountQuery?.data?.webhooksTotalCount || 0,
    loading: listQuery.loading || totalCountQuery.loading,
    removeWebhook,
  };

  return <WebhookList {...updatedProps} />;
};

const options = ({ queryParams }: { queryParams: any }): any => {
  return {
    variables: {
      ...generatePaginationParams(queryParams),
      _id: queryParams._id,
      searchValue: queryParams.searchValue,
    },
    fetchPolicy: 'network-only',
  };
};

export default WebhookListContainer;
