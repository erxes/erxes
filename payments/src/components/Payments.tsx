import { Component } from 'react';

import PaymentOption from './common/PaymentOption';

type Props = {
  datas: any[];
  queryParams?: any;
};

type State = {
  show: boolean;
};
class Dashboard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      show: true,
    };
  }

  hideModal = () => {
    this.setState({ show: false });
  };

  render() {
    const { datas, queryParams } = this.props;
    const { show } = this.state;

    return (
      <div>
        <PaymentOption show={show} handleClose={this.hideModal} datas={datas} />
      </div>
    );
  }
}

export default Dashboard;
