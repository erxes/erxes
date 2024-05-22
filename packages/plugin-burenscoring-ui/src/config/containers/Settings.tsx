import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { ConfigsResponse, IConfigsMaps } from '../../types';
import { mutations, queries } from '../../graphql';

import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  component: any;
  configCode: string;
};
type FinalProps = {
  configsQuery: ConfigsResponse;
  updateConfigs: (configsMap: IConfigsMaps) => Promise<void>;
} & Props;

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, configsQuery } = this.props;

    // create or update action
    const save = (map: IConfigsMaps) => {
      updateConfigs({
        variables: { configsMap: map },
      })
        .then(() => {
          configsQuery.refetch();

          Alert.success(
            'You successfully updated scoring config',
          );
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    };

    const configs = configsQuery.configs || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    const Component = this.props.component;
    const updatedProps = {
      ...this.props,
      configsMap,
      save,
      loading: configsQuery.loading,
    };
    return <Component {...updatedProps}/>
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConfigsResponse>(gql(queries.BurenConfigs), {
      name: 'configsQuery'
    }),
    graphql<{}>(gql(mutations.updateScoringConfigs), {
      name: 'updateConfigs',
    }),
  )(SettingsContainer),
);
