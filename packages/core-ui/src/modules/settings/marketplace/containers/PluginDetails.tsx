import * as compose from 'lodash.flowright';

import PluginDetails from '../components/detail/PluginDetails';
import React from 'react';
import Spinner from 'modules/common/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '@erxes/ui-settings/src/general/graphql';
import { queries } from '../graphql';
import { withProps } from 'modules/common/utils';
import { Plugin } from '../types';

type Props = {
  id: string;
};

type FinalProps = {
  manageInstall;
  enabledServicesQuery;
} & Props;

type State = {
  plugin: Plugin;
  plugins: Plugin[];
};

class PluginDetailsContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      plugin: {} as Plugin,
      plugins: []
    };
  }

  async componentDidMount() {
    const url =
      process.env.NODE_ENV === 'production'
        ? `https://erxes.io/api/pluginDetail?id=${this.props.id}`
        : `http://127.0.0.1:3500/api/pluginDetail?id=${this.props.id}`;

    fetch(url)
      .then(async response => {
        const plugin = await response.json();

        this.setState({ plugin });
      })
      .catch(e => {
        console.error(e);
      });

    const pluginsUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://erxes.io/api/plugins'
        : 'http://127.0.0.1:3500/api/plugins';

    fetch(pluginsUrl)
      .then(async response => {
        const plugins = await response.json();

        this.setState({ plugins });
      })
      .catch(e => {
        console.error(e, 'error');
      });
  }

  render() {
    const { plugin, plugins } = this.state;

    if (!plugin || Object.keys(plugin).length === 0) {
      return <Spinner objective={true} />;
    }

    return (
      <PluginDetails {...this.props} plugin={plugin || {}} plugins={plugins} />
    );
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
