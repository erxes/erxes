// frontend/plugins/mongolian_ui/src/modules/productplaces/containers/Settings.tsx
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
  console.log('SettingsContainer - configCode:', props.configCode);

  const configsQuery = useQuery<ConfigsQueryResponse>(gql(queries.configs), {
    variables: {
      code: props.configCode,
    },
    fetchPolicy: 'network-only',
  });

  console.log('SettingsContainer - query state:', {
    loading: configsQuery.loading,
    error: configsQuery.error,
    data: configsQuery.data
  });

  const [updateConfigs] = useMutation(gql(mutations.updateConfigs));

  if (configsQuery.loading) {
    console.log('SettingsContainer - loading...');
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (configsQuery.error) {
    console.log('SettingsContainer - error:', configsQuery.error);
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading configuration: {configsQuery.error.message}
      </div>
    );
  }

  // create or update action
  const save = (map: IConfigsMap) => {
    console.log('SettingsContainer - saving:', map);
    updateConfigs({
      variables: { configsMap: map },
    })
      .then(() => {
        configsQuery.refetch();
        console.log('Successfully updated configuration');
      })
      .catch((error) => {
        console.error('Failed to update configuration:', error.message);
      });
  };

  const config = configsQuery.data?.configsGetValue;
  
  console.log('SettingsContainer - config:', config);
  
  if (!config) {
    console.log('SettingsContainer - no config found');
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        No configuration found for code: {props.configCode}
      </div>
    );
  }

  // Check what the config value actually is
  console.log('SettingsContainer - config value:', config.value);
  
  // The configsMap should be structured like: { [configCode]: config.value }
  const configsMap = { [config.code]: config.value };
  
  console.log('SettingsContainer - final configsMap:', configsMap);

  const Component = props.component;
  return <Component {...props} configsMap={configsMap} save={save} />;
};

export default SettingsContainer;