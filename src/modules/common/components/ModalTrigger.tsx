import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';

type Props = {
  title: string;
  trigger: React.ReactNode;
  content: ({ closeModal }: { closeModal: () => void }) => void;
  size?: string;
  ignoreTrans?: boolean;
  dialogClassName?: string;
};

type State = {
  isOpen?: boolean;
};

class ModalTrigger extends React.Component<Props, State> {
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
      content
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
      <React.Fragment>
        {triggerComponent}

        <Modal
          dialogClassName={dialogClassName}
          bsSize={size}
          show={isOpen}
          onHide={this.closeModal}
        >
          <Modal.Header closeButton={true}>
            <Modal.Title>{ignoreTrans ? title : __(title)}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isOpen && content({ closeModal: this.closeModal })}
          </Modal.Body>
        </Modal>
      </React.Fragment>
    );
  }
}

export default ModalTrigger;
