import React from 'react';
import Store from '../components/Store';

type Props = {};

type State = {
  plugins: any;
};

class StoreContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      plugins: []
    };
  }

  async componentDidMount() {
    const url =
      process.env.NODE_ENV === 'production'
        ? 'https://erxes.io/plugins'
        : 'http://127.0.0.1:3500/plugins';

    fetch(url)
      .then(async response => {
        const plugins = await response.json();

        this.setState({ plugins });
      })
      .catch(e => {
        console.log(e, 'error');
      });
  }

  render() {
    if (!this.state.plugins || this.state.plugins.length === 0) {
      return null;
    }

    return <Store plugins={this.state.plugins} />;
  }
}

export default StoreContainer;
