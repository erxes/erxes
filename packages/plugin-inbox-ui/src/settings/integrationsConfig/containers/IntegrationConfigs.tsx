import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  mutations,
  queries
} from '@erxes/ui-inbox/src/settings/integrations/graphql';

import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import IntegrationsConfig from '../components/IntegrationConfigs';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type FinalProps = {
  integrationsConfigsQuery;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
};

class ConfigContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, integrationsConfigsQuery } = this.props;

    if (integrationsConfigsQuery.loading) {
      return <Spinner objective={true} />;
    }

    // create or update action
    const save = (map: IConfigsMap) => {
      updateConfigs({
        variables: { configsMap: map }
      })
        .then(() => {
          integrationsConfigsQuery.refetch();

          Alert.success('You successfully updated general settings');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const configs = integrationsConfigsQuery.integrationsGetConfigs || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    return (
      <IntegrationsConfig {...this.props} configsMap={configsMap} save={save} />
    );
  }
}

export default withProps<{}>(
  compose(
    graphql<{}>(gql(queries.integrationsGetConfigs), {
      name: 'integrationsConfigsQuery'
    }),
    graphql<{}>(gql(mutations.integrationsUpdateConfigs), {
      name: 'updateConfigs'
    })
  )(ConfigContainer)
);
