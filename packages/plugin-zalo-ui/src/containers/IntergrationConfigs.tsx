import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import React from 'react';

import { Alert, withProps } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';
import Settings from '../components/IntegrationSettings';
import { mutations, queries } from '../graphql';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';

type Props = {
  history: any;
};

type FinalProps = {
  getConfigsQuery: any;
  updateConfigsMutation: (configsMap: IConfigsMap) => Promise<void>;
} & Props;

const ConfigsContainer = (props: FinalProps) => {
  const { getConfigsQuery, updateConfigsMutation } = props;

  if (getConfigsQuery.loading) {
    return <Spinner />;
  }

  const configs = getConfigsQuery.zaloGetConfigs;
  const configsMap = {};

  console.log('configs', configs, getConfigsQuery);

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  const updateConfigs = (value: IConfigsMap) => {
    updateConfigsMutation({ variables: { configsMap: value } })
      .then(() => {
        Alert.success('Successfully updated configs');
        getConfigsQuery.refetch();
      })
      .catch(e => Alert.error(e.message));
  };

  const updatedProps = {
    loading: getConfigsQuery.loading,
    updateConfigs,
    configsMap
  };

  return <Settings {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.zaloGetConfigs), {
      name: 'getConfigsQuery',
      options: () => ({
        fetchPolicy: 'network-only',
        variables: { kind: 'zalo' }
      })
    }),

    graphql(gql(mutations.zaloUpdateConfigs), {
      name: 'updateConfigsMutation'
    })
  )(ConfigsContainer)
);
