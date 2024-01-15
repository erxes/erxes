import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';

import { graphql } from '@apollo/client/react/hoc';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import Configs from '../components/Configs';

const CONFIGS = gql(`
    query Query {
      bidGetConfigs
    }
`);

const UPDATE_CONFIGS = gql(`
    mutation configsUpdate($configsMap: JSON!) {
      configsUpdate(configsMap: $configsMap)
  }
`);

type FinalProps = {
  bidGetConfigsQuery;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
};

class ConfigContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, bidGetConfigsQuery } = this.props;

    if (bidGetConfigsQuery.loading) {
      return <Spinner objective={true} />;
    }

    // create or update action
    const save = (map: IConfigsMap) => {
      updateConfigs({
        variables: { configsMap: map },
      })
        .then(() => {
          bidGetConfigsQuery.refetch();

          Alert.success('You successfully updated settings');
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    };

    const configs = bidGetConfigsQuery.bidGetConfigs || [];

    return <Configs {...this.props} configsMap={configs} save={save} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}>(CONFIGS, {
      name: 'bidGetConfigsQuery',
    }),
    graphql<{}>(UPDATE_CONFIGS, {
      name: 'updateConfigs',
    }),
  )(ConfigContainer),
);
