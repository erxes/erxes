import { IUser } from 'modules/auth/types';
import { IAttachment } from 'modules/common/types';
import { __, extractAttachment } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { IEditFormContent, IItem, IItemParams, IOptions } from '../../types';

type Props = {
  options: IOptions;
  item: IItem;
  users: IUser[];
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
  extraFields?: any;
  extraFieldsCheck?: () => boolean;
  amount?: () => React.ReactNode;
  sidebar?: () => React.ReactNode;
  formContent: (
    { state, onChangeAttachment, onChangeField, copy, remove }: IEditFormContent
  ) => React.ReactNode;
  onHideModal?: () => void;
};

type State = {
  name: string;
  stageId: string;
  description: string;
  closeDate: Date;
  assignedUserIds: string[];
  customers: ICustomer[];
  companies: ICompany[];
  attachments: IAttachment[];
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
      attachments: extractAttachment(item.attachments),
      assignedUserIds: (item.assignedUsers || []).map(user => user._id)
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  onChangeAttachment = (attachments: IAttachment[]) => {
    this.setState({ attachments });
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

  render() {
    return (
      <Modal
        enforceFocus={false}
        bsSize="lg"
        show={true}
        onHide={this.props.onHideModal}
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
            remove: this.remove
          })}
        </Modal.Body>
      </Modal>
    );
  }
}

export default EditForm;
