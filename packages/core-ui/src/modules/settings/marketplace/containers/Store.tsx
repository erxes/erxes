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
    fetch('https://erxes.io/plugins')
      .then(async response => {
        const plugins = await response.json();

        this.setState({ plugins });
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    return <Store plugins={this.state.plugins} />;
  }
}

export default StoreContainer;
