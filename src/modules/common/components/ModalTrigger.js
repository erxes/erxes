import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

const propTypes = {
  title: PropTypes.string.isRequired,
  trigger: PropTypes.element.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.string,
  ignoreTrans: PropTypes.bool,
  dialogClassName: PropTypes.string
};

const childContextTypes = {
  closeModal: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class ModalTrigger extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: props.isOpen || false };

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

ModalTrigger.propTypes = propTypes;
ModalTrigger.contextTypes = contextTypes;
ModalTrigger.childContextTypes = childContextTypes;

export default ModalTrigger;
