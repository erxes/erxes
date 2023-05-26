import { ArchiveStatus } from '../../styles/item';
import Icon from '@erxes/ui/src/components/Icon';
import { CloseModal } from '@erxes/ui/src/styles/main';
import { __, router as routerUtils } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { IEditFormContent, IItem, IItemParams, IOptions } from '../../types';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  options: IOptions;
  item: IItem;
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  copyItem: (itemId: string, callback: () => void, msg?: string) => void;
  beforePopupClose: (afterPopupClose?: () => void) => void;
  amount?: () => React.ReactNode;
  formContent: ({ state, copy, remove }: IEditFormContent) => React.ReactNode;
  onUpdate: (item: IItem, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
  isPopupVisible?: boolean;
  hideHeader?: boolean;
  refresh: boolean;
} & IRouterProps;

type State = {
  stageId?: string;
  updatedItem?: IItem;
  prevStageId?: string;
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      stageId: item.stageId,
      updatedItem: item
    };
  }

  onChangeStage = (stageId: string) => {
    this.setState({ stageId }, () => {
      const { item, saveItem, onUpdate } = this.props;

      if (item.stageId !== this.state.stageId) {
        this.setState({
          prevStageId: item.stageId
        });

        saveItem({ stageId }, updatedItem => {
          if (onUpdate) {
            onUpdate(updatedItem, this.state.prevStageId);
          }
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
    const { item, copyItem, options } = this.props;

    copyItem(item._id, this.closeModal, options.texts.copySuccessText);
  };

  closeModal = (afterPopupClose?: () => void) => {
    const { beforePopupClose } = this.props;

    if (beforePopupClose) {
      beforePopupClose(afterPopupClose);
    } else if (afterPopupClose) {
      afterPopupClose();
    }
  };

  onHideModal = () => {
    const { history, refresh } = this.props;

    if (refresh) {
      routerUtils.setParams(history, { key: Math.random() });
    }

    this.closeModal(() => {
      const { prevStageId, updatedItem } = this.state;

      if (updatedItem) {
        const itemName = localStorage.getItem(`${updatedItem._id}Name`) || '';

        if (itemName && updatedItem.name !== itemName) {
          this.saveItem({ itemName });
        }

        localStorage.removeItem(`${updatedItem._id}Name`);
      }

      if (updatedItem && this.props.onUpdate) {
        this.props.onUpdate(updatedItem, prevStageId);
      }
    });
  };

  renderArchiveStatus() {
    if (this.props.item.status === 'archived') {
      return (
        <ArchiveStatus>
          <Icon icon="archive-alt" />
          <span>{__('This card is archived.')}</span>
        </ArchiveStatus>
      );
    }

    return null;
  }

  renderHeader() {
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
  }

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
        {this.renderArchiveStatus()}
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

export default withRouter(EditForm);
