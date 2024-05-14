import React from 'react';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  when: boolean;
  children: any;
  navigate: any;
  location: any;
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
    const { navigate, location, when } = this.props;

    this.blockRoute = navigate(nextLocation => {
      if (when && nextLocation.pathname !== location.pathname) {
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
    const { save, navigate, queryParams, name } = this.props;

    if (queryParams.isCreate && this.state.isConfirm && name) {
      save();
    }

    if (!queryParams.isCreate && this.state.isConfirm) {
      save();
    }

    this.blockRoute();

    navigate(this.state.nextLocation.pathname);
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
