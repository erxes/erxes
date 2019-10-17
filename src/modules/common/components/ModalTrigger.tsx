import { __ } from 'modules/common/utils';
import React from 'react';
import { Modal } from 'react-bootstrap';
import RTG from 'react-transition-group';
import { CloseModal } from '../styles/main';
import Icon from './Icon';

type Props = {
  title: string;
  trigger: React.ReactNode;
  content: ({ closeModal }: { closeModal: () => void }) => void;
  size?: string;
  ignoreTrans?: boolean;
  dialogClassName?: string;
  backDrop?: string;
  enforceFocus?: boolean;
  hideHeader?: boolean;
  isOpen?: boolean;
  onExit?: () => void;
};

type State = {
  isOpen?: boolean;
};

class ModalTrigger extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { isOpen: props.isOpen || false };
  }

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  renderHeader = () => {
    if (this.props.hideHeader) {
      return (
        <CloseModal onClick={this.closeModal}>
          <Icon icon="times" />
        </CloseModal>
      );
    }

    const { title, ignoreTrans } = this.props;

    return (
      <Modal.Header closeButton={true}>
        <Modal.Title>{ignoreTrans ? title : __(title)}</Modal.Title>
      </Modal.Header>
    );
  };

  render() {
    const {
      trigger,
      size,
      dialogClassName,
      content,
      backDrop,
      enforceFocus,
      onExit
    } = this.props;

    const { isOpen } = this.state;

    // add onclick event to the trigger component
    const triggerComponent = React.cloneElement(
      trigger as React.ReactElement<any>,
      {
        onClick: this.openModal
      }
    );

    return (
      <>
        {triggerComponent}

        <Modal
          dialogClassName={dialogClassName}
          bsSize={size}
          show={isOpen}
          onHide={this.closeModal}
          backdrop={backDrop}
          enforceFocus={enforceFocus}
          onExit={onExit}
        >
          {this.renderHeader()}
          <Modal.Body>
            <RTG.Transition in={isOpen} timeout={300} unmountOnExit={true}>
              {content({ closeModal: this.closeModal })}
            </RTG.Transition>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export default ModalTrigger;
