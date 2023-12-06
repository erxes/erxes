import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '@erxes/ui/src/utils';
import List from '../components/GeneralSettings';
import { ConfigsQueryResponse, IConfigsMap } from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
} & Props;

const GeneralSettingsContainer = (props: FinalProps) => {
  const { updateConfigs, configsQuery } = props;
  if (configsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const config = configsQuery.configsGetValue || [];

  const configsMap = { [config.code]: config.value };

  const save = (map: IConfigsMap) => {
    updateConfigs({
      variables: { configsMap: map }
    })
      .then(() => {
        configsQuery.refetch();

        Alert.success('You successfully updated stage in syncerkhet settings');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    save,
    configsMap
  };
  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ConfigsQueryResponse>(gql(queries.configs), {
      name: 'configsQuery',
      options: () => ({
        variables: {
          code: 'DYNAMIC'
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<{}>(gql(mutations.updateConfigs), {
      name: 'updateConfigs'
    })
  )(GeneralSettingsContainer)
);
