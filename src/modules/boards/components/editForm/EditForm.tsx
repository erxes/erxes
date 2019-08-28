import { IUser } from 'modules/auth/types';
import { FormFooter } from 'modules/boards/styles/item';
import Button from 'modules/common/components/Button';
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

const reactiveFields = ['closeDate', 'stageId', 'assignedUserIds'];

type Props = {
  options: IOptions;
  item: IItem;
  users: IUser[];
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
  extraFields?: any;
  extraFieldsCheck?: () => boolean;
  amount?: () => React.ReactNode;
  sidebar?: () => React.ReactNode;
  formContent: (
    { state, onChangeAttachment, onChangeField, copy, remove }: IEditFormContent
  ) => React.ReactNode;
  onUpdate: (item, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
  isPopupVisible?: boolean;
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
      assignedUserIds: (item.assignedUsers || []).map(user => user._id)
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
          this.setState({ updatedItem });
        });
      }
    });
  };

  onBlurFields = (name: 'name' | 'description', value: string) => {
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

  save = () => {
    const { companies, customers, updatedItem, prevStageId } = this.state;
    const { saveItem } = this.props;

    const doc = {
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id)
    };

    if (updatedItem && prevStageId) {
      this.props.onUpdate(updatedItem, prevStageId);

      return this.closeModal();
    }

    saveItem(doc, result => {
      this.props.onUpdate(result);
      this.closeModal();
    });
  };

  copy = () => {
    const { item, addItem, options } = this.props;

    // copied doc
    const doc = {
      ...item,
      assignedUserIds: item.assignedUsers.map(user => user._id),
      companyIds: item.companies.map(company => company._id),
      customerIds: item.customers.map(customer => customer._id)
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

  render() {
    const { isFormVisible } = this.state;

    if (!isFormVisible) {
      return null;
    }

    return (
      <Modal
        enforceFocus={false}
        bsSize="lg"
        show={true}
        onHide={this.onHideModal}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{__('Edit deal')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.formContent({
            state: this.state,
            onChangeAttachment: this.onChangeAttachment,
            onChangeField: this.onChangeField,
            copy: this.copy,
            remove: this.remove,
            onBlurFields: this.onBlurFields
          })}

          <FormFooter>
            <Button
              btnStyle="simple"
              onClick={this.onHideModal}
              icon="cancel-1"
            >
              Close
            </Button>

            <Button btnStyle="success" icon="checked-1" onClick={this.save}>
              Save
            </Button>
          </FormFooter>
        </Modal.Body>
      </Modal>
    );
  }
}

export default EditForm;
