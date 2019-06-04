import { ActivityInputs } from 'modules/activityLogs/components';
import { ActivityLogs } from 'modules/activityLogs/containers';
import { IUser } from 'modules/auth/types';
import { Button } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import { FlexContent, FormFooter, Left } from 'modules/deals/styles/deal';
import * as React from 'react';
import { STAGE_CONSTANTS } from '../../constants';
import { Item, ItemParams } from '../../types';
import { Sidebar, Top } from './';

type Props = {
  type: string;
  item: Item;
  users: IUser[];
  addItem: (doc: ItemParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: ItemParams, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
  extraFields?: any;
  extraFieldsCheck?: () => void;
  amount?: () => React.ReactNode;
  sidebar?: () => React.ReactNode;
};

type State = {
  name: string;
  stageId: string;
  description: string;
  closeDate: Date;
  assignedUserIds: string[];
  customers: ICustomer[];
  companies: ICompany[];
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      name: item.name,
      stageId: item.stageId,
      // Item datas
      companies: item.companies || [],
      customers: item.customers || [],
      closeDate: item.closeDate,
      description: item.description || '',
      assignedUserIds: (item.assignedUsers || []).map(user => user._id)
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  save = () => {
    const {
      name,
      description,
      companies,
      customers,
      closeDate,
      stageId,
      assignedUserIds
    } = this.state;

    const { closeModal, saveItem, extraFields, extraFieldsCheck } = this.props;

    if (!name) {
      return Alert.error('Enter a name');
    }

    if (extraFieldsCheck) {
      extraFieldsCheck();
    }

    const doc = {
      name,
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id),
      closeDate,
      description,
      stageId,
      assignedUserIds,
      ...extraFields
    };

    saveItem(doc, () => {
      closeModal();
    });
  };

  remove = id => {
    const { removeItem, closeModal } = this.props;

    removeItem(id, () => closeModal());
  };

  copy = () => {
    const { item, closeModal, addItem, type } = this.props;

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
      STAGE_CONSTANTS[type].copySuccessText
    );
  };

  renderFormContent() {
    const { item, users, type, amount, sidebar } = this.props;

    const {
      name,
      stageId,
      description,
      closeDate,
      assignedUserIds,
      customers,
      companies
    } = this.state;

    return (
      <>
        <Top
          type={type}
          name={name}
          description={description}
          closeDate={closeDate}
          amount={amount}
          assignedUserIds={assignedUserIds}
          users={users}
          stageId={stageId}
          item={item}
          onChangeField={this.onChangeField}
        />

        <FlexContent>
          <Left>
            <ActivityInputs
              contentTypeId={item._id}
              contentType={type}
              showEmail={false}
            />
            <ActivityLogs
              target={item.name}
              contentId={item._id}
              contentType={type}
              extraTabs={[]}
            />
          </Left>

          <Sidebar
            customers={customers}
            companies={companies}
            item={item}
            sidebar={sidebar}
            onChangeField={this.onChangeField}
            copyItem={this.copy}
            removeItem={this.remove}
          />
        </FlexContent>
      </>
    );
  }

  render() {
    return (
      <>
        {this.renderFormContent()}

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
