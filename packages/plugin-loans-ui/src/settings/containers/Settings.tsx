import { gql } from '@apollo/client';
import { Spinner, Alert } from '@erxes/ui/src';
import React from 'react';
import { mutations, queries } from '../graphql';
import { ConfigsQueryResponse, IConfigsMap } from '../types';
import { useMutation, useQuery } from '@apollo/client';

type Props = {
  components: any;
};

const SettingsContainer = (props: Props) => {
  const configsQuery = useQuery<ConfigsQueryResponse>(gql(queries.configs));
  const [updateConfigs] = useMutation(gql(mutations.updateConfigs));

  if (configsQuery.loading) {
    return <Spinner objective={true} />;
  }

  // create or update action
  const save = (map: IConfigsMap) => {
    updateConfigs({
      variables: { configsMap: map },
    })
      .then(() => {
        configsQuery.refetch();

        Alert.success('You successfully updated loan settings');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const configs = configsQuery?.data?.configs || [];

  const configsMap = {};

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  const Component = props.components;

  return <Component {...props} configsMap={configsMap} save={save} />;
};

export default SettingsContainer;
