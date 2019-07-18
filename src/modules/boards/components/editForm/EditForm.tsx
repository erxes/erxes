import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';
import { Alert, extractAttachment } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { FlexContent, FormFooter, Left, TitleRow } from '../../styles/item';
import { IItem, IItemParams, IOptions } from '../../types';
import Sidebar from './Sidebar';
import Top from './Top';

type Props = {
  options: IOptions;
  item: IItem;
  users: IUser[];
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IItemParams, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
  extraFields?: any;
  extraFieldsCheck?: () => boolean;
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

  save = () => {
    const {
      name,
      description,
      companies,
      customers,
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
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id),
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

  remove = id => {
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

  renderFormContent() {
    const { item, users, options, amount, sidebar } = this.props;

    const {
      name,
      stageId,
      description,
      closeDate,
      assignedUserIds,
      customers,
      companies,
      attachments
    } = this.state;

    const descriptionOnChange = e =>
      this.onChangeField('description', (e.target as HTMLInputElement).value);

    return (
      <>
        <Top
          options={options}
          name={name}
          description={description}
          closeDate={closeDate}
          amount={amount}
          users={users}
          stageId={stageId}
          item={item}
          onChangeField={this.onChangeField}
        />

        <FlexContent>
          <Left>
            <FormGroup>
              <TitleRow>
                <ControlLabel>
                  <Icon icon="attach" />
                  Attachments
                </ControlLabel>
              </TitleRow>

              <Uploader
                defaultFileList={attachments}
                onChange={this.onChangeAttachment}
              />
            </FormGroup>

            <FormGroup>
              <TitleRow>
                <ControlLabel>
                  <Icon icon="alignleft" />
                  Description
                </ControlLabel>
              </TitleRow>

              <FormControl
                componentClass="textarea"
                defaultValue={description}
                onChange={descriptionOnChange}
              />
            </FormGroup>

            <ActivityInputs
              contentTypeId={item._id}
              contentType={options.type}
              showEmail={false}
            />

            <ActivityLogs
              target={item.name}
              contentId={item._id}
              contentType={options.type}
              extraTabs={[]}
            />
          </Left>

          <Sidebar
            options={options}
            customers={customers}
            companies={companies}
            assignedUserIds={assignedUserIds}
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
