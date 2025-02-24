import React from 'react';
import Spinner from 'modules/common/components/Spinner';
import Store from '../components/Store';
import { Plugin } from '../types';

type State = {
  plugins: Plugin[];
};

class StoreContainer extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      plugins: []
    };
  }

  async componentDidMount() {
    const url =
      process.env.NODE_ENV === 'production'
        ? 'https://erxes.io/api/plugins'
        : 'http://127.0.0.1:3500/api/plugins';

    fetch(url)
      .then(async response => {
        const plugins = await response.json();

        this.setState({ plugins });
      })
      .catch(e => {
        console.error(e, 'error');
      });
  }

  render() {
    if (!this.state.plugins || this.state.plugins.length === 0) {
      return <Spinner objective={true} />;
    }

    return <Store plugins={this.state.plugins} />;
  }
}

export default StoreContainer;
