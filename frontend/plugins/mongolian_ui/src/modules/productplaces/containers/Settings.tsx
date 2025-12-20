import { gql } from '@apollo/client';
import React from 'react';
import { Spinner } from 'erxes-ui';
import { useQuery, useMutation } from '@apollo/client';

import { mutations, queries } from '../graphql';
import { ConfigsQueryResponse, IConfigsMap } from '../types';

type Props = {
  component: any;
  configCode: string;
};

const SettingsContainer = (props: Props) => {
  const configsQuery = useQuery<ConfigsQueryResponse>(gql(queries.configs), {
    variables: {
      code: props.configCode,
    },
    fetchPolicy: 'network-only',
  });

  const [updateConfigs] = useMutation(gql(mutations.updateConfigs));

  if (configsQuery.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (configsQuery.error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading configuration: {configsQuery.error.message}
      </div>
    );
  }

  // create or update action
  const save = (map: IConfigsMap) => {
    updateConfigs({
      variables: { configsMap: map },
    })
      .then(() => {
        configsQuery.refetch();
        // Success - you could show a message or just update silently
        console.log('Successfully updated configuration');
      })
      .catch((error) => {
        console.error('Failed to update configuration:', error.message);
        // Error - you could show a message or just log it
      });
  };

  const config = configsQuery.data?.configsGetValue;
  
  if (!config) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        No configuration found for code: {props.configCode}
      </div>
    );
  }

  const configsMap = { [config.code]: config.value };

  const Component = props.component;
  return <Component {...props} configsMap={configsMap} save={save} />;
};

export default SettingsContainer;