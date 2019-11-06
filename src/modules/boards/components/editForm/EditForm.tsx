import Icon from 'modules/common/components/Icon';
import { CloseModal } from 'modules/common/styles/main';
import { IAttachment } from 'modules/common/types';
import { __, extractAttachment } from 'modules/common/utils';
import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import {
  BoardItem,
  FieldName,
  IEditFormContent,
  IItem,
  IItemParams,
  IOptions
} from '../../types';

const reactiveFields = [
  'closeDate',
  'stageId',
  'assignedUserIds',
  'isComplete',
  'reminderMinute',
  'priority'
];

const reactiveForiegnFields = ['companies', 'customers', 'labels'];

type Props = {
  options: IOptions;
  item: IItem;
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
  amount?: () => React.ReactNode;
  formContent: (
    { state, onChangeAttachment, onChangeField, copy, remove }: IEditFormContent
  ) => React.ReactNode;
  onUpdate: (item, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
  isPopupVisible?: boolean;
  hideHeader?: boolean;
};

type State = {
  stageId?: string;
  updatedItem?;
  prevStageId?;
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      stageId: props.item.stageId
    };
  }

  onChangeField = (name: FieldName, value: BoardItem[FieldName]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>, () => {
      if (this.props.item.stageId !== this.state.stageId) {
        this.setState({
          prevStageId: this.props.item.stageId
        });
      }

      if (reactiveFields.includes(name)) {
        this.props.saveItem({ [name]: value }, updatedItem => {
          this.setState({ updatedItem }, () => {
            if (name === 'stageId') {
              this.props.onUpdate(updatedItem, this.state.prevStageId);
            }
          });
        });
      }

      if (reactiveForiegnFields.includes(name)) {
        this.props.saveItem({}, updatedItem => {
          this.setState({ updatedItem });
        });
      }
    });
  };

  onBlurFields = (name: string, value: string) => {
    if (value === this.props.item[name]) {
      return;
    }

    this.props.saveItem({ [name]: value }, updatedItem => {
      this.setState({ updatedItem });
    });
  };

  onChangeAttachment = (attachments: IAttachment[]) => {
    this.props.saveItem({ attachments });
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
            onChangeAttachment: this.onChangeAttachment,
            onChangeField: this.onChangeField,
            copy: this.copy,
            remove: this.remove,
            onBlurFields: this.onBlurFields
          })}
        </Modal.Body>
      </Modal>
    );
  }
}

export default EditForm;
