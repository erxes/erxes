import * as compose from 'lodash.flowright';

import PluginDetails from '../components/detail/PluginDetails';
import React from 'react';
import Spinner from 'modules/common/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { mutations } from '@erxes/ui-settings/src/general/graphql';
import { queries } from '../graphql';
import { withProps } from 'modules/common/utils';

type Props = {
  id: string;
};

type FinalProps = {
  manageInstall;
  enabledServicesQuery;
} & Props;

type State = {
  plugin: any;
};

class PluginDetailsContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      plugin: {}
    };
  }

  async componentDidMount() {
    await fetch(`https://erxes.io/pluginDetail/${this.props.id}`)
      .then(async response => {
        const plugin = await response.json();

        this.setState({ plugin });
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const { plugin } = this.state;

    if (!plugin || Object.keys(plugin).length === 0) {
      return <Spinner objective={true} />;
    }

    return <PluginDetails {...this.props} plugin={plugin || {}} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, {}, {}>(gql(queries.enabledServices), {
      name: 'enabledServicesQuery'
    }),
    graphql<{}>(gql(mutations.managePluginInstall), {
      name: 'manageInstall'
    })
  )(PluginDetailsContainer)
);
