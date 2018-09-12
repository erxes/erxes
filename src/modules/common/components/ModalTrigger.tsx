import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';

type Props = {
  title: string,
  trigger: any,
  children: React.ReactNode,
  size?: string,
  ignoreTrans?: boolean,
  dialogClassName?: string
};

type State = {
  isOpen?: boolean
}

class ModalTrigger extends Component<Props, State> {
  static childContextTypes = {
    closeModal: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = { isOpen: false };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  getChildContext() {
    return { closeModal: this.closeModal };
  }

  openModal() {
    this.setState({ isOpen: true });
  }

  closeModal() {
    this.setState({ isOpen: false });
  }

  render() {
    const {
      title,
      trigger,
      children,
      size,
      ignoreTrans,
      dialogClassName
    } = this.props;
    const { __ } = this.context;

    // add onclick event to the trigger component
    const triggerComponent = React.cloneElement(trigger, {
      onClick: this.openModal
    });

    return (
      <Fragment>
        {triggerComponent}

        <Modal
          dialogClassName={dialogClassName}
          bsSize={size}
          show={this.state.isOpen}
          onHide={this.closeModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>{ignoreTrans ? title : __(title)}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
        </Modal>
      </Fragment>
    );
  }
}

export default ModalTrigger;
