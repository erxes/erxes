import React from 'react';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  when: boolean;
  children: any;
  history: any;
  queryParams: any;
  id: string;
  name: string;
  save: () => void;
  removeFlows: (
    doc: { flowIds: string[] },
    navigateToNextLocation: () => void
  ) => void;
};

type State = { nextLocation; showModal: boolean; isConfirm: boolean };

class Confirmation extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      nextLocation: {},
      showModal: false,
      isConfirm: false
    };
  }

  componentDidUpdate() {
    const { history, when } = this.props;

    this.blockRoute = history.block(nextLocation => {
      if (when && nextLocation.pathname !== history.location.pathname) {
        this.setState({
          showModal: true,
          nextLocation
        });
      }

      return !when;
    });
  }

  componentWillUnmount() {
    this.blockRoute();
  }

  onCancel = () => {
    const { removeFlows, queryParams, id } = this.props;

    if (queryParams.isCreate) {
      return removeFlows({ flowIds: [id] }, this.navigateToNextLocation);
    }

    return this.navigateToNextLocation();
  };

  onConfirm = () => {
    const { name } = this.props;

    if (!name || name === 'Your automation title') {
      Alert.error('Enter an Automation title');

      return this.setState({ showModal: false });
    }

    this.setState({ isConfirm: true }, () => {
      return this.navigateToNextLocation();
    });
  };

  navigateToNextLocation = () => {
    const { save, history, queryParams, name } = this.props;

    if (queryParams.isCreate && this.state.isConfirm && name) {
      save();
    }

    if (!queryParams.isCreate && this.state.isConfirm) {
      save();
    }

    this.blockRoute();

    history.push(this.state.nextLocation.pathname);
  };

  blockRoute = () => null;

  render() {
    return this.props.children(
      this.state.showModal,
      this.onConfirm,
      this.onCancel
    );
  }
}

export default Confirmation;
