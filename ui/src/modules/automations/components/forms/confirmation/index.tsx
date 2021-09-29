import React from 'react';

type Props = {
  when: boolean;
  children: any;
  history: any;
  queryParams: any;
  id: string;
  save: () => void;
  removeAutomations: (
    doc: { automationIds: string[] },
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

  componentDidMount() {
    const { history, when } = this.props;

    this.unblock = history.block(nextLocation => {
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
    this.unblock();
  }

  onCancel = () => {
    const { removeAutomations, queryParams, id } = this.props;

    if (queryParams.isCreate) {
      return removeAutomations(
        { automationIds: [id] },
        this.navigateToNextLocation
      );
    }

    return this.navigateToNextLocation();
  };

  onConfirm = () => {
    this.setState({ isConfirm: true }, () => {
      return this.navigateToNextLocation();
    });
  };

  navigateToNextLocation = () => {
    const { save, history, queryParams } = this.props;

    if (!queryParams.isCreate && this.state.isConfirm) {
      save();
    }

    this.unblock();

    history.push(this.state.nextLocation.pathname);
  };

  unblock = () => null;

  render() {
    return this.props.children(
      this.state.showModal,
      this.onConfirm,
      this.onCancel
    );
  }
}

export default Confirmation;
