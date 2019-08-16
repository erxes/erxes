import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import { IAttachment } from 'modules/common/types';
import { Alert, extractAttachment } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { FormFooter } from '../../styles/item';
import { IEditFormContent, IItem, IItemParams, IOptions } from '../../types';

type Props = {
  options: IOptions;
  item: IItem;
  users: IUser[];
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IItemParams, callback: () => void) => void;
  createConformity: (relTypeId: string, relTypeIds: string[]) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
  extraFields?: any;
  extraFieldsCheck?: () => boolean;
  amount?: () => React.ReactNode;
  sidebar?: () => React.ReactNode;
  formContent: (
    { state, onChangeAttachment, onChangeField, copy, remove }: IEditFormContent
  ) => React.ReactNode;
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
    switch (name) {
      case 'companies':
        const companyIds = (value as ICompany[]).map(company => company._id);
        this.props.createConformity('company', companyIds);
        break;

      case 'customers':
        const customerIds = (value as ICustomer[]).map(
          customer => customer._id
        );
        this.props.createConformity('customer', customerIds);
        break;
    }

    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  onChangeAttachment = (attachments: IAttachment[]) => {
    this.setState({ attachments });
  };

  save = () => {
    const {
      name,
      description,
      closeDate,
      stageId,
      assignedUserIds,
      attachments
    } = this.state;

    const { closeModal, saveItem, extraFields, extraFieldsCheck } = this.props;

    if (!name) {
      return Alert.error('Enter a name');
    }

    if (extraFieldsCheck && !extraFieldsCheck()) {
      return extraFieldsCheck();
    }

    const doc = {
      name,
      closeDate,
      description,
      stageId,
      assignedUserIds,
      attachments,
      ...extraFields
    };

    saveItem(doc, () => {
      closeModal();
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
      assignedUserIds: item.assignedUsers.map(user => user._id)
    };

    addItem(
      doc,
      () => closeModal && closeModal(),
      options.texts.copySuccessText
    );
  };

  render() {
    return (
      <>
        {this.props.formContent({
          state: this.state,
          onChangeAttachment: this.onChangeAttachment,
          onChangeField: this.onChangeField,
          copy: this.copy,
          remove: this.remove
        })}

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={this.save}>
            Save
          </Button>
        </FormFooter>
      </>
    );
  }
}

export default EditForm;
