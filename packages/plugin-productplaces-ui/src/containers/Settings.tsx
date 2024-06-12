import { gql,useQuery, useMutation } from '@apollo/client';
import { Alert } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import React from 'react';
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
    return <Spinner objective={true} />;
  }

  // create or update action
  const save = (map: IConfigsMap) => {
    updateConfigs({
      variables: { configsMap: map },
    })
      .then(() => {
        configsQuery.refetch();

        Alert.success(
          'You successfully updated stage in product places settings',
        );
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const config =
    (configsQuery.data && configsQuery.data.configsGetValue) || ([] as any);

  const configsMap = { [config.code]: config.value };

  const Component = props.component;
  return <Component {...props} configsMap={configsMap} save={save} />;
};

export default SettingsContainer;
