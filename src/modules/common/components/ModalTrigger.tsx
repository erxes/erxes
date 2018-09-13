import { __ } from 'modules/common/utils';
import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';

type Props = {
  title: string,
  trigger: any,
  children?: React.ReactNode,
  content?: ({ closeModal } : { closeModal: () => void }) => void,
  contentProps?: any,
  size?: string,
  ignoreTrans?: boolean,
  dialogClassName?: string
};

type State = {
  isOpen?: boolean
}

class ModalTrigger extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
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
      size,
      ignoreTrans,
      dialogClassName,
      children,
      content,
    } = this.props;

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
          <Modal.Body>
            {content ? content({ closeModal: this.closeModal }) : children }
          </Modal.Body>
        </Modal>
      </Fragment>
    );
  }
}

export default ModalTrigger;
