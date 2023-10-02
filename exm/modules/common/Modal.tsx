import React from "react";
import Modal from "simple-react-modal";
import Icon from "./Icon";
import { ModalWrapper, ModalClose } from "../styles/main";

type Props = {
  isOpen?: boolean;
  isFull?: boolean;
  onClose?: () => void;
  content: ({ closeModal }: { closeModal: () => void }) => React.ReactNode;
};

export default class ModalComponent extends React.Component<
  Props,
  { show: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { show: props.isOpen || false };
  }

  onCancel = () => {
    const { onClose } = this.props;

    this.setState({ show: false });

    if (onClose) {
      onClose();
    }
  };

  render() {
    const { content, isOpen, isFull } = this.props;

    return (
      <ModalWrapper isFull={isFull}>
        <Modal
          className="client-modal"
          closeOnOuterClick={true}
          show={isOpen || this.state.show}
          onClose={this.onCancel}
        >
          <div className="modal-content">
            <ModalClose onClick={this.onCancel}>
              <Icon icon="times" />
            </ModalClose>

            {content({ closeModal: this.onCancel })}
          </div>
        </Modal>
      </ModalWrapper>
    );
  }
}
