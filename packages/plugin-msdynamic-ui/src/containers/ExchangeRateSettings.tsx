import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '@erxes/ui/src/utils';
import List from '../components/settings/ExchangeRateSettings';
import { ConfigsQueryResponse, IConfigsMap } from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
};

const ExchangeRateSettingsContainer = (props: FinalProps) => {
  const { updateConfigs, configsQuery } = props;
  if (configsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const save = (map: IConfigsMap) => {
    updateConfigs({
      variables: { configsMap: map },
    })
      .then(() => {
        configsQuery.refetch();

        Alert.success(
          'You successfully updated stage in msdynamic exchange rates settings'
        );
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const config = configsQuery.configsGetValue || [];

  const configsMap = { [config.code]: config.value };

  const updatedProps = {
    ...props,
    save,
    configsMap,
  };
  return <List {...updatedProps} />;
};

export default withProps<FinalProps>(
  compose(
    graphql<FinalProps, ConfigsQueryResponse>(gql(queries.configs), {
      name: 'configsQuery',
      options: () => ({
        variables: {
          code: 'DYNAMIC_EXCHANGE_RATE',
        },
        fetchPolicy: 'network-only',
      }),
    }),
    graphql<{}>(gql(mutations.updateConfigs), {
      name: 'updateConfigs',
    })
  )(ExchangeRateSettingsContainer)
);
