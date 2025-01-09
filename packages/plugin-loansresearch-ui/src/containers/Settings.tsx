import { gql, useMutation } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { mutations, queries } from '../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { ConfigsQueryResponse, IConfig } from '../types';
import GeneralSettings from '../components/GeneralSettings';

type Props = {
  queryParams: any;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
} & Props;

const GeneralSettingsContainer = (props: FinalProps) => {
  const { configsQuery } = props;
  const [addHistoryMutation] = useMutation(gql(mutations.adConfigUpdate));

  if (configsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const config = configsQuery.adConfigs || {};

  const saveConfig = (doc: IConfig) => {
    addHistoryMutation({
      variables: { ...doc },
    })
      .then(() => {
        configsQuery.refetch();

        Alert.success('You successfully updated active director config');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    config,
    saveConfig,
    loading: configsQuery.loading,
  };
  return <GeneralSettings {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ConfigsQueryResponse>(gql(queries.adConfigs), {
      name: 'configsQuery',
      options: () => ({
        variables: {
          code: 'ACTIVEDIRECTOR',
        },
        fetchPolicy: 'network-only',
      }),
    }),
    graphql<{}>(gql(mutations.adConfigUpdate), {
      name: 'updateConfigs',
      options: {
        refetchQueries: ['adConfigs'],
      },
    })
  )(GeneralSettingsContainer)
);
