import Icon from 'modules/common/components/Icon';
import { CloseModal } from 'modules/common/styles/main';
import { __, extractAttachment } from 'modules/common/utils';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { IEditFormContent, IItem, IItemParams, IOptions } from '../../types';

type Props = {
  options: IOptions;
  item: IItem;
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
  amount?: () => React.ReactNode;
  formContent: ({ state, copy, remove }: IEditFormContent) => React.ReactNode;
  onUpdate: (item: IItem, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
  isPopupVisible?: boolean;
  hideHeader?: boolean;
  savePipelineLabels: (labels: string[]) => void;
};

type State = {
  stageId?: string;
  updatedItem?: IItem;
  prevStageId?: string;
  labelIds: string[];
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      stageId: props.item.stageId,
      labelIds: props.item.labelIds || []
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

  onChangeLabels = (labelIds: string[]) => {
    if (labelIds) {
      this.setState({ labelIds });
    }
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

    const customers = item.customers || [];
    const companies = item.companies || [];

    // copied doc
    const doc = {
      ...item,
      attachments: item.attachments && extractAttachment(item.attachments),
      assignedUserIds: item.assignedUsers.map(user => user._id),
      customerIds: customers.map(customer => customer._id),
      companyIds: companies.map(company => company._id)
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
    const { updatedItem, prevStageId, labelIds } = this.state;

    if (updatedItem) {
      this.props.onUpdate(updatedItem, prevStageId);
    }

    this.props.savePipelineLabels(labelIds);

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
        size="lg"
        show={this.props.isPopupVisible}
        onHide={this.onHideModal}
        animation={false}
      >
        {this.renderHeader()}
        <Modal.Body>
          {this.props.formContent({
            state: this.state,
            saveItem: this.saveItem,
            onChangeStage: this.onChangeStage,
            copy: this.copy,
            remove: this.remove,
            onChangeLabels: this.onChangeLabels
          })}
        </Modal.Body>
      </Modal>
    );
  }
}

export default EditForm;
