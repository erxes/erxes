import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import { CloseModal } from 'modules/common/styles/main';
import { IAttachment } from 'modules/common/types';
import { __, extractAttachment } from 'modules/common/utils';
import routerUtils from 'modules/common/utils/router';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import queryString from 'query-string';
import React from 'react';
import { Modal } from 'react-bootstrap';
import history from '../../../../browserHistory';
import { IEditFormContent, IItem, IItemParams, IOptions } from '../../types';

const reactiveFields = [
  'closeDate',
  'stageId',
  'assignedUserIds',
  'isComplete',
  'reminderMinute'
];

const reactiveForiegnFields = ['companies', 'customers'];

type Props = {
  options: IOptions;
  item: IItem;
  users: IUser[];
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
  amount?: () => React.ReactNode;
  sidebar?: () => React.ReactNode;
  formContent: (
    { state, onChangeAttachment, onChangeField, copy, remove }: IEditFormContent
  ) => React.ReactNode;
  onUpdate: (item, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
  isPopupVisible?: boolean;
  hideHeader?: boolean;
};

type State = {
  isFormVisible?: boolean;
  name?: string;
  stageId?: string;
  description?: string;
  closeDate?: Date;
  assignedUserIds?: string[];
  customers: ICustomer[];
  companies: ICompany[];
  attachments?: IAttachment[];
  updatedItem?;
  prevStageId?;
  reminderMinute?: number;
  isComplete?: boolean;
};

class EditForm extends React.Component<Props, State> {
  unlisten?: () => void;

  constructor(props) {
    super(props);

    const item = props.item;

    const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

    let isFormVisible = false;

    if (itemIdQueryParam === item._id || props.isPopupVisible) {
      isFormVisible = true;
    }

    this.state = {
      isFormVisible,
      name: item.name,
      stageId: item.stageId,
      // IItem datas
      companies: item.companies || [],
      customers: item.customers || [],
      closeDate: item.closeDate,
      description: item.description || '',
      attachments: item.attachments && extractAttachment(item.attachments),
      assignedUserIds: (item.assignedUsers || []).map(user => user._id),
      reminderMinute: item.reminderMinute || 0,
      isComplete: item.isComplete
    };
  }

  componentDidMount() {
    this.unlisten = history.listen(location => {
      const queryParams = queryString.parse(location.search);

      if (queryParams.itemId === this.props.item._id) {
        return this.setState({ isFormVisible: true });
      }
    });
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPopupVisible && nextProps.isPopupVisible === true) {
      this.setState({ isFormVisible: true });
    }
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
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
      this.setState(
        {
          updatedItem
        },
        () => {
          if (this.state.isFormVisible === false) {
            this.props.onUpdate(updatedItem);
          }
        }
      );
    });
  };

  onChangeAttachment = (attachments: IAttachment[]) => {
    this.setState({ attachments }, () => {
      this.props.saveItem({ attachments }, updatedItem => {
        this.setState({ updatedItem });
      });
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
    const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

    if (beforePopupClose) {
      beforePopupClose();
    }

    this.setState({ isFormVisible: false });

    if (itemIdQueryParam) {
      routerUtils.removeParams(history, 'itemId');
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
    const { isFormVisible } = this.state;

    return (
      <Modal
        dialogClassName="modal-1000w"
        enforceFocus={false}
        bsSize="lg"
        show={isFormVisible}
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
