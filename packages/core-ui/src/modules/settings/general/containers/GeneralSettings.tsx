import * as compose from 'lodash.flowright';

import { Alert, withProps } from 'modules/common/utils';
import {
  ConfigsQueryResponse,
  IConfigsMap
} from '@erxes/ui-settings/src/general/types';
import { mutations, queries } from '@erxes/ui-settings/src/general/graphql';

import { AppConsumer } from 'appContext';
import GeneralSettings from '../components/GeneralSettings';
import React from 'react';
import Spinner from 'modules/common/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  constantsQuery;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
};

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, configsQuery, constantsQuery } = this.props;

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

          Alert.success('You successfully updated general settings');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const configs = configsQuery.configs || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    return (
      <AppConsumer>
        {({ currentLanguage, changeLanguage }) => (
          <GeneralSettings
            {...this.props}
            configsMap={configsMap}
            constants={constantsQuery?.configsConstants || {}}
            save={save}
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
          />
        )}
      </AppConsumer>
    );
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, ConfigsQueryResponse>(gql(queries.configs), {
      name: 'configsQuery'
    }),
    graphql<{}>(gql(queries.configsConstants), {
      name: 'constantsQuery'
    }),
    graphql<{}>(gql(mutations.updateConfigs), {
      name: 'updateConfigs'
    })
  )(SettingsContainer)
);
