import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Spinner, Alert, withProps } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import Settings from '../components/Settings';
import { mutations, queries } from '../graphql';
import { ConfigsQueryResponse, IConfigsMap } from '../types';

type Props = {
  history: any;
  queryParams: any;
  onChangePos: (posId: string) => Promise<void>;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
} & Props;

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, configsQuery } = this.props;

    if (configsQuery.loading) {
      return <Spinner objective={true} />;
    }

    // create or update action
    const save = (posId: string, map: IConfigsMap) => {
      updateConfigs({
        variables: { posId, configsMap: map }
      })
        .then(() => {
          configsQuery.refetch();

          Alert.success('You successfully updated POS settings');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const configs = configsQuery.posConfigs || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    return <Settings {...this.props} configsMap={configsMap} save={save} />;
  }
}

// const getRefetchQueries = () => {
//   return [
//     'configs',
//   ];
// };

// const options = () => ({
//   refetchQueries: getRefetchQueries()
// });

export default withProps<{}>(
  compose(
    graphql<{ queryParams: any }, ConfigsQueryResponse, { posId: string }>(
      gql(queries.configs),
      {
        name: 'configsQuery',
        options: ({ queryParams }) => ({
          variables: { posId: queryParams.posId || '' },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }>(gql(mutations.updateConfigs), {
      name: 'updateConfigs'
    })
  )(SettingsContainer)
);
