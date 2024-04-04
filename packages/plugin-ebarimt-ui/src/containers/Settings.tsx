import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { ConfigsQueryResponse, IConfigsMap } from '../types';
import { mutations, queries } from '../graphql';

import React from 'react';
import { Spinner } from '@erxes/ui/src/components';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  component: any;
  configCode: string;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
} & Props;

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, configsQuery } = this.props;

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

    const config = configsQuery.configsGetValue || [];

    const configsMap = { [config.code]: config.value };
    const Component = this.props.component;

    return <Component {...this.props} configsMap={configsMap} save={save} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConfigsQueryResponse>(gql(queries.configs), {
      name: 'configsQuery',
      options: props => ({
        variables: {
          code: props.configCode
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<{}>(gql(mutations.updateConfigs), {
      name: 'updateConfigs'
    })
  )(SettingsContainer)
);
