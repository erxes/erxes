import { Component } from 'react';
import Modal from './common/Modal';

type Props = {
  datas: any[];
}

type State = {
  show: boolean;
};
class Dashboard extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      show: true
    };
  }

  hideModal = () => {
    this.setState({ show: false });
  };

  render() {

    const { datas } = this.props;
    const { show } = this.state;

    console.log(datas);

    return (
      <div>
        <Modal show={show} handleClose={this.hideModal} datas={datas} />
      </div>
    );
  }
}

export default Dashboard;
