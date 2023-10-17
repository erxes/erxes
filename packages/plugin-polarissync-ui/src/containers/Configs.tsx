import * as compose from 'lodash.flowright';

import {
  mutations,
  queries
} from '@erxes/ui-inbox/src/settings/integrations/graphql';
import { Alert, withProps } from '@erxes/ui/src/utils';

import { graphql } from '@apollo/client/react/hoc';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import Configs from '../components/Configs';

const CONFIGS = gql(`
    query Query {
        polarisGetConfigs
    }
`);

const UPDATE_CONFIGS = gql(`
    mutation configsUpdate($configsMap: JSON!) {
  configsUpdate(configsMap: $configsMap)
}
`);

type FinalProps = {
  polarisConfigsQuery;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
};

class ConfigContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, polarisConfigsQuery } = this.props;

    if (polarisConfigsQuery.loading) {
      return <Spinner objective={true} />;
    }

    // create or update action
    const save = (map: IConfigsMap) => {
      updateConfigs({
        variables: { configsMap: map }
      })
        .then(() => {
          polarisConfigsQuery.refetch();

          Alert.success('You successfully updated settings');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const configs = polarisConfigsQuery.polarisGetConfigs || [];

    return <Configs {...this.props} configsMap={configs} save={save} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}>(CONFIGS, {
      name: 'polarisConfigsQuery'
    }),
    graphql<{}>(UPDATE_CONFIGS, {
      name: 'updateConfigs'
    })
  )(ConfigContainer)
);
