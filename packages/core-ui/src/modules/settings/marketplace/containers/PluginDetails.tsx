import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';

import { withProps } from 'modules/common/utils';

import { mutations } from '@erxes/ui-settings/src/general/graphql';

import PluginDetails from '../components/detail/PluginDetails';

type Props = {
  id: string;
};

type FinalProps = {
  manageInstall;
  enabledServicesQuery;
} & Props;

class PluginDetailsContainer extends React.Component<FinalProps> {
  render() {
    const { id, enabledServicesQuery, manageInstall } = this.props;
    return (
      <PluginDetails
        id={id}
        enabledServicesQuery={enabledServicesQuery}
        manageInstall={manageInstall}
      />
    );
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, {}, {}>(
      gql(`query enabledServices {
          enabledServices
        }`),
      {
        name: 'enabledServicesQuery'
      }
    ),
    graphql<{}>(gql(mutations.managePluginInstall), {
      name: 'manageInstall'
    })
  )(PluginDetailsContainer)
);
