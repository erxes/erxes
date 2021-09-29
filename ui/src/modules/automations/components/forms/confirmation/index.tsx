import React from 'react';

type Props = {
  when: boolean;
  children: any;
  history: any;
  queryParams: any;
  id: string;
  removeAutomations: (
    doc: { automationIds: string[] },
    navigateToNextLocation: () => void
  ) => void;
};

class Confirmation extends React.Component<
  Props,
  { nextLocation; showModal: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      nextLocation: {},
      showModal: false
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
    this.navigateToNextLocation();
  };

  navigateToNextLocation = () => {
    this.unblock();

    this.props.history.push(this.state.nextLocation.pathname);
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
