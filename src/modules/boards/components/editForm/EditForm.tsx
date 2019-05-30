import { ActivityInputs } from 'modules/activityLogs/components';
import { ActivityLogs } from 'modules/activityLogs/containers';
import { IUser } from 'modules/auth/types';
import { Button } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import { FlexContent, FormFooter, Left } from 'modules/deals/styles/deal';
import { IProduct } from 'modules/settings/productService/types';
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
};

type State = {
  name: string;
  stageId: string;
  description: string;
  closeDate: Date;
  amount: any;
  assignedUserIds: string[];
  customers: ICustomer[];
  companies: ICompany[];
  products: IProduct[];
  productsData: any;
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      name: item.name,
      stageId: item.stageId,
      amount: item.amount || {},
      // Item datas
      companies: item.companies || [],
      customers: item.customers || [],
      closeDate: item.closeDate,
      description: item.description || '',
      productsData: item.products ? item.products.map(p => ({ ...p })) : [],
      // collecting data for ItemCounter component
      products: item.products ? item.products.map(p => p.product) : [],
      assignedUserIds: (item.assignedUsers || []).map(user => user._id)
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  saveProductsData = () => {
    const { productsData } = this.state;
    const products: IProduct[] = [];
    const amount: any = {};

    const filteredProductsData: any = [];

    productsData.forEach(data => {
      // products
      if (data.product) {
        if (data.currency) {
          // calculating item amount
          if (!amount[data.currency]) {
            amount[data.currency] = data.amount || 0;
          } else {
            amount[data.currency] += data.amount || 0;
          }
        }

        // collecting data for ItemCounter component
        products.push(data.product);

        data.productId = data.product._id;

        filteredProductsData.push(data);
      }
    });

    this.setState({ productsData: filteredProductsData, products, amount });
  };

  save = () => {
    const {
      name,
      description,
      companies,
      customers,
      closeDate,
      productsData,
      stageId,
      assignedUserIds
    } = this.state;

    const { closeModal, saveItem, type } = this.props;

    if (!name) {
      return Alert.error('Enter a name');
    }

    if (productsData.length === 0 && type === 'deal') {
      return Alert.error('Select product & service');
    }

    const doc = {
      name,
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id),
      closeDate,
      description,
      productsData,
      stageId,
      assignedUserIds
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
    const { item, users, type } = this.props;

    const {
      name,
      stageId,
      description,
      closeDate,
      amount,
      assignedUserIds,
      customers,
      companies,
      products,
      productsData
    } = this.state;

    return (
      <>
        <Top
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
            type={type}
            customers={customers}
            companies={companies}
            products={products}
            productsData={productsData}
            item={item}
            onChangeField={this.onChangeField}
            copyItem={this.copy}
            removeItem={this.remove}
            saveProductsData={this.saveProductsData}
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
