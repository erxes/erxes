import Icon from 'modules/common/components/Icon';
import { CloseModal } from 'modules/common/styles/main';
import { extractAttachment, __ } from 'modules/common/utils';
import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import { IEditFormContent, IItem, IItemParams, IOptions } from '../../types';

type Props = {
  options: IOptions;
  item: IItem;
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
  amount?: () => React.ReactNode;
  formContent: ({ state, copy, remove }: IEditFormContent) => React.ReactNode;
  onUpdate: (item, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
  isPopupVisible?: boolean;
  hideHeader?: boolean;
};

type State = {
  stageId?: string;
  updatedItem?: IItem;
  prevStageId?: string;
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      stageId: props.item.stageId
    };
  }

  onChangeStage = (stageId: string) => {
    this.setState({ stageId }, () => {
      if (this.props.item.stageId !== this.state.stageId) {
        this.setState({
          prevStageId: this.props.item.stageId
        });

        this.props.saveItem({ stageId }, updatedItem => {
          this.props.onUpdate(updatedItem, this.state.prevStageId);
        });
      }
    });
  };

  saveItem = (doc: { [key: string]: any }) => {
    this.props.saveItem(doc, updatedItem => {
      this.setState({ updatedItem });
    });
  };

  remove = (id: string) => {
    const { removeItem } = this.props;

    removeItem(id, this.closeModal);
  };

  copy = () => {
    const { item, addItem, options } = this.props;

    // copied doc
    const doc = {
      ...item,
      attachments: item.attachments && extractAttachment(item.attachments),
      assignedUserIds: item.assignedUsers.map(user => user._id)
    };

    addItem(doc, this.closeModal, options.texts.copySuccessText);
  };

  closeModal = () => {
    const { beforePopupClose } = this.props;

    if (beforePopupClose) {
      beforePopupClose();
    }
  };

  onHideModal = () => {
    const { updatedItem, prevStageId } = this.state;

    if (updatedItem) {
      this.props.onUpdate(updatedItem, prevStageId);
    }

    this.closeModal();
  };

  renderHeader = () => {
    if (this.props.hideHeader) {
      return (
        <CloseModal onClick={this.onHideModal}>
          <Icon icon="times" />
        </CloseModal>
      );
    }

    return (
      <Modal.Header closeButton={true}>
        <Modal.Title>{__('Edit')}</Modal.Title>
      </Modal.Header>
    );
  };

  render() {
    return (
      <Modal
        dialogClassName="modal-1000w"
        enforceFocus={false}
        bsSize="lg"
        show={this.props.isPopupVisible}
        onHide={this.onHideModal}
      >
        {this.renderHeader()}
        <Modal.Body>
          {this.props.formContent({
            state: this.state,
            saveItem: this.saveItem,
            onChangeStage: this.onChangeStage,
            copy: this.copy,
            remove: this.remove
          })}
        </Modal.Body>
      </Modal>
    );
  }
}

export default EditForm;
