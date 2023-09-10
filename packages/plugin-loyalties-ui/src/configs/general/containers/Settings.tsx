import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Settings from '../components/Settings';
import { mutations, queries } from '../graphql';
import { ConfigsQueryResponse, IConfigsMap } from '../types';

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
};

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, configsQuery } = this.props;

    if (configsQuery.loading) {
      return <Spinner objective={true} />;
    }

    // create or update action
    const save = (map: IConfigsMap) => {
      updateConfigs({
        variables: { configsMap: map }
      })
        .then(() => {
          configsQuery.refetch();

          Alert.success('You successfully updated loyalty settings');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const configs = configsQuery.loyaltyConfigs || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    return <Settings {...this.props} configsMap={configsMap} save={save} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, ConfigsQueryResponse>(gql(queries.loyaltyConfigs), {
      name: 'configsQuery'
    }),
    graphql<{}>(gql(mutations.updateLoyaltyConfigs), {
      name: 'updateConfigs'
    })
  )(SettingsContainer)
);
