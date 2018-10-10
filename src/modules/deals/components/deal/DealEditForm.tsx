import { IUser } from 'modules/auth/types';
import { Button } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { ICompany } from '../../../companies/types';
import { ICustomer } from '../../../customers/types';
import { IProduct } from '../../../settings/productService/types';
import { Tab } from '../../containers';
import { FlexContent, FormFooter } from '../../styles/deal';
import { IDeal, IDealParams, IDragResult } from '../../types';
import { Sidebar, Top } from './editForm';

type Props = {
  deal: IDeal;
  users: IUser[];
  index?: number;
  saveDeal: (doc: IDealParams, callback: () => void, deal?: IDeal) => void;
  removeDeal: (_id: string, callback?: () => void) => void;
  move?: (doc: IDragResult) => void;
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
  disabled: boolean;
};

class DealEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.onChangeField = this.onChangeField.bind(this);
    this.saveProductsData = this.saveProductsData.bind(this);
    this.save = this.save.bind(this);
    this.copy = this.copy.bind(this);

    const deal = props.deal;

    this.state = {
      amount: deal.amount || {},
      disabled: false,
      name: deal.name,
      stageId: deal.stageId,

      // Deal datas
      closeDate: deal.closeDate,
      companies: deal.companies || [],
      customers: deal.customers || [],
      description: deal.description || '',
      productsData: deal.products ? deal.products.map(p => ({ ...p })) : [],

      // collecting data for ItemCounter component
      assignedUserIds: (deal.assignedUsers || []).map(user => user._id),
      products: deal.products ? deal.products.map(p => p.product) : []
    };
  }

  onChangeField<T extends keyof State>(name: T, value: State[T]) {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  }

  saveProductsData() {
    const { productsData } = this.state;
    const products: IProduct[] = [];
    const amount: any = {};

    const filteredProductsData: any = [];

    productsData.forEach(data => {
      // products
      if (data.product) {
        if (data.currency) {
          // calculating deal amount
          if (!amount[data.currency]) amount[data.currency] = data.amount || 0;
          else amount[data.currency] += data.amount || 0;
        }

        // collecting data for ItemCounter component
        products.push(data.product);

        data.productId = data.product._id;

        filteredProductsData.push(data);
      }
    });

    this.setState({ productsData: filteredProductsData, products, amount });
  }

  save() {
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

    const { deal, index = 0, closeModal, saveDeal, move } = this.props;

    if (!name) return Alert.error(__('Enter name'));

    if (productsData.length === 0)
      return Alert.error(__('Please, select product & service'));

    const doc = {
      assignedUserIds,
      closeDate: closeDate && new Date(closeDate),
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id),
      description,
      name,
      productsData,
      stageId
    };

    // before save, disable save button
    this.setState({ disabled: true });

    saveDeal(
      doc,
      () => {
        // after save, enable save button
        this.setState({ disabled: false });

        closeModal();
      },
      deal
    );

    // if changed stageId, update ui
    if (move && deal.stageId !== stageId) {
      const moveDoc = {
        destination: { _id: stageId, index: 0 },
        itemId: deal._id,
        source: { _id: deal.stageId, index },
        type: 'stage'
      };

      move(moveDoc);
    }
  }

  remove(id) {
    const { removeDeal, closeModal } = this.props;

    removeDeal(id, () => closeModal());
  }

  copy() {
    const { deal, closeModal, saveDeal } = this.props;

    // copied doc
    const doc = {
      ...deal,
      assignedUserIds: deal.assignedUsers.map(user => user._id),
      companyIds: deal.companies.map(company => company._id),
      customerIds: deal.customers.map(customer => customer._id)
    };

    saveDeal(doc, () => closeModal && closeModal());
  }

  renderFormContent() {
    const { deal, users, removeDeal } = this.props;

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
      <React.Fragment>
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
          <Tab deal={deal} />
          <Sidebar
            customers={customers}
            companies={companies}
            products={products}
            productsData={productsData}
            deal={deal}
            onChangeField={this.onChangeField}
            removeDeal={removeDeal}
            saveProductsData={this.saveProductsData}
          />
        </FlexContent>
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.renderFormContent()}

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checked-1"
            onClick={this.save}
          >
            Save
          </Button>
        </FormFooter>
      </React.Fragment>
    );
  }
}

export default DealEditForm;
