import { IUser } from 'modules/auth/types';
import { IAttachment } from 'modules/common/types';
import { __, extractAttachment } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { IEditFormContent, IItem, IItemParams, IOptions } from '../../types';

const reactiveFields = [
  'closeDate',
  'stageId',
  'assignedUserIds',
  'customers',
  'companies'
];

type Props = {
  options: IOptions;
  item: IItem;
  users: IUser[];
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: (callback?) => void;
  extraFields?: any;
  extraFieldsCheck?: () => boolean;
  amount?: () => React.ReactNode;
  sidebar?: () => React.ReactNode;
  formContent: (
    { state, onChangeAttachment, onChangeField, copy, remove }: IEditFormContent
  ) => React.ReactNode;
  onUpdate: (item, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
};

type State = {
  name?: string;
  stageId?: string;
  description?: string;
  closeDate?: Date;
  assignedUserIds?: string[];
  customers?: ICustomer[];
  companies?: ICompany[];
  attachments?: IAttachment[];
  updatedItem?;
  prevStageId?;
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
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

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>, () => {
      let fieldName: string = name;

      if (this.props.item.stageId !== this.state.stageId) {
        this.setState({
          prevStageId: this.props.item.stageId
        });
      }

      if (reactiveFields.includes(name)) {
        if (name === 'companies') {
          value = value.map(coc => coc._id);
          fieldName = 'companyIds';
        }

        if (name === 'customers') {
          value = value.map(coc => coc._id);
          fieldName = 'customerIds';
        }

        this.props.saveItem({ [fieldName]: value }, updatedItem => {
          this.setState({ updatedItem });
        });
      }
    });
  };

  onBlurFields = (name: 'name' | 'description', value: string) => {
    this.props.saveItem({ [name]: value }, updatedItem => {
      this.setState({
        updatedItem
      });
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
    const { removeItem, closeModal } = this.props;

    removeItem(id, () => closeModal());
  };

  copy = () => {
    const { item, closeModal, addItem, options } = this.props;

    // copied doc
    const doc = {
      ...item,
      assignedUserIds: item.assignedUsers.map(user => user._id),
      companyIds: item.companies.map(company => company._id),
      customerIds: item.customers.map(customer => customer._id)
    };

    addItem(
      doc,
      () => closeModal && closeModal(),
      options.texts.copySuccessText
    );
  };

  onHideModal = () => {
    const { updatedItem, prevStageId } = this.state;

    this.props.closeModal(() => {
      if (updatedItem) {
        this.props.onUpdate(updatedItem, prevStageId);
      }
    });
  };

  render() {
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
        </Modal.Body>
      </Modal>
    );
  }
}

export default EditForm;
