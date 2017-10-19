import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

const propTypes = {
  title: PropTypes.string.isRequired,
  trigger: PropTypes.element.isRequired,
  children: PropTypes.node.isRequired,
};

const childContextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class ModalTrigger extends Component {
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
    const { title, trigger, children } = this.props;

    // add onclick event to the trigger component
    const triggerComponent = React.cloneElement(trigger, {
      onClick: this.openModal,
    });

    return (
      <span>
        {triggerComponent}

        <Modal show={this.state.isOpen} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {children}
          </Modal.Body>
        </Modal>
      </span>
    );
  }
}

ModalTrigger.propTypes = propTypes;
ModalTrigger.childContextTypes = childContextTypes;

export default ModalTrigger;
