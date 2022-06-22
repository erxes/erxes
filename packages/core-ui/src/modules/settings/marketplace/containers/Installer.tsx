import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';

import { withProps } from 'modules/common/utils';

import { mutations } from '@erxes/ui-settings/src/general/graphql';

import Installer from '../components/Installer';

type FinalProps = {
  manageInstall;
  enabledServicesQuery;
};

class InstallerContainer extends React.Component<FinalProps> {
  render() {
    const { enabledServicesQuery, manageInstall } = this.props;
    return (
      <Installer
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
  )(InstallerContainer)
);
