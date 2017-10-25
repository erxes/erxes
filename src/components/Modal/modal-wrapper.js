import React from 'react';
import Modal, { Modalheader, Modalbody, Modalfooter } from './index';

export default class asd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalisVisible: false
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  openModal() {
    this.setState({ modalisVisible: true });
  }
  closeModal() {
    this.setState({ modalisVisible: false });
  }
  render() {
    return (
      <div>
        <button onClick={this.openModal}>Open Modal</button>
        <Modal visible={this.state.modalisVisible}>
          <Modalheader>
            <h2>Modal title</h2>
          </Modalheader>
          <Modalbody>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Modalbody>
          <Modalfooter onClose={this.closeModal} />
        </Modal>
      </div>
    );
  }
}
