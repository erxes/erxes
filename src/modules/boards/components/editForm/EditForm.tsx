import { ActivityInputs } from 'modules/activityLogs/components';
import { ActivityLogs } from 'modules/activityLogs/containers';
import { IUser } from 'modules/auth/types';
import { Button } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import { IDeal, IDealParams } from 'modules/deals/types';
import { FlexContent, FormFooter, Left } from 'modules/deals/styles/deal';
import { IProduct } from 'modules/settings/productService/types';
import { Sidebar, Top } from './';

type Props = {
  deal: IDeal;
  users: IUser[];
  addItem: (doc: IDealParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IDealParams, callback: () => void) => void;
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

class DealEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const deal = props.deal;

    this.state = {
      name: deal.name,
      stageId: deal.stageId,
      amount: deal.amount || {},
      // Deal datas
      companies: deal.companies || [],
      customers: deal.customers || [],
      closeDate: deal.closeDate,
      description: deal.description || '',
      productsData: deal.products ? deal.products.map(p => ({ ...p })) : [],
      // collecting data for ItemCounter component
      products: deal.products ? deal.products.map(p => p.product) : [],
      assignedUserIds: (deal.assignedUsers || []).map(user => user._id)
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
          // calculating deal amount
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

    const { closeModal, saveItem } = this.props;

    if (!name) {
      return Alert.error('Enter a name');
    }

    if (productsData.length === 0) {
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
    const { deal, closeModal, addItem } = this.props;

    // copied doc
    const doc = {
      ...deal,
      assignedUserIds: deal.assignedUsers.map(user => user._id),
      companyIds: deal.companies.map(company => company._id),
      customerIds: deal.customers.map(customer => customer._id)
    };

    addItem(
      doc,
      () => closeModal && closeModal(),
      `You successfully copied a deal`
    );
  };

  renderFormContent() {
    const { deal, users } = this.props;

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
          deal={deal}
          onChangeField={this.onChangeField}
        />

        <FlexContent>
          <Left>
            <ActivityInputs
              contentTypeId={deal._id}
              contentType="deal"
              showEmail={false}
            />
            <ActivityLogs
              target={deal.name}
              contentId={deal._id}
              contentType="deal"
              extraTabs={[]}
            />
          </Left>

          <Sidebar
            customers={customers}
            companies={companies}
            products={products}
            productsData={productsData}
            deal={deal}
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

export default DealEditForm;
