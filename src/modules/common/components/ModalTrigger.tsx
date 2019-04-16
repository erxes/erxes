import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import * as RTG from 'react-transition-group';

type Props = {
  title: string;
  trigger: React.ReactNode;
  content: ({ closeModal }: { closeModal: () => void }) => void;
  size?: string;
  ignoreTrans?: boolean;
  dialogClassName?: string;
  backDrop?: string;
};

type State = {
  isOpen?: boolean;
};

class ModalTrigger extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
  }

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const {
      title,
      trigger,
      size,
      ignoreTrans,
      dialogClassName,
      content,
      backDrop
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
        >
          <Modal.Header closeButton={true}>
            <Modal.Title>{ignoreTrans ? title : __(title)}</Modal.Title>
          </Modal.Header>
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
