import { Alert } from '@erxes/ui/src/utils';
import { ConfigsQueryResponse, IConfig, IConfigsMap } from '../types';
import { mutations, queries } from '../graphql';

import React from 'react';
import { Spinner } from '@erxes/ui/src/components';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  component: any;
  configCode: string;
};

type FinalProps = {} & Props;

const SettingsContainer: React.FC<FinalProps> = props => {
  const configsQuery = useQuery<ConfigsQueryResponse>(gql(queries.configs), {
    variables: {
      code: props.configCode
    },
    fetchPolicy: 'network-only'
  });

  const [updateConfigs] = useMutation(gql(mutations.updateConfigs));

  if (configsQuery.loading) {
    return <Spinner />;
  }

  // create or update action
  const save = (map: IConfigsMap) => {
    updateConfigs({
      variables: { configsMap: map }
    })
      .then(() => {
        configsQuery.refetch();

        Alert.success('You successfully updated ebarimt settings');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const config =
    (configsQuery.data && configsQuery.data.configsGetValue) || ({} as IConfig);

  const configsMap = { [config.code]: config.value };
  const Component = props.component;

  return <Component {...props} configsMap={configsMap} save={save} />;
};

export default SettingsContainer;
