import { Button } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import React, { Fragment } from 'react';
import { Tab } from '../../containers';
import { FlexContent, FormFooter } from '../../styles/deal';
import { Sidebar, Top } from './editForm';

type Props = {
  deal?: any,
  saveDeal?: any,
  removeDeal?: any,
  users: any,
  dealActivityLog?: any,
  index?: number,
  closeModal?: () => void,
  move?: (any) => void
};

type State = {
  name: string,
  stageId: string,
  description: string,
  closeDate: Date,
  amount: any,
  assignedUserIds: string[],
  customers: any,
  companies: any,
  products: any,
  productsData: any,
  disabled: boolean
}

class DealEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.onChangeField = this.onChangeField.bind(this);
    this.saveProductsData = this.saveProductsData.bind(this);
    this.save = this.save.bind(this);
    this.copy = this.copy.bind(this);

    const deal = props.deal;

    this.state = {
      name: deal.name,
      stageId: deal.stageId,
      disabled: false,
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

  onChangeField(name, value) {
    this.setState({ [name]: value });
  }

  saveProductsData() {
    const { productsData } = this.state;
    const products = [];
    const amount = {};

    const filteredProductsData = [];

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

    const { deal, index, closeModal, move } = this.props;

    if (!name) return Alert.error(__('Enter name'));

    if (productsData.length === 0)
      return Alert.error(__('Please, select product & service'));

    const doc = {
      name,
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id),
      closeDate: closeDate ? new Date(closeDate) : null,
      description,
      productsData,
      stageId,
      assignedUserIds
    };

    // before save, disable save button
    this.setState({ disabled: true });

    this.props.saveDeal(
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
        source: { _id: deal.stageId, index },
        destination: { _id: stageId, index: 0 },
        itemId: deal._id,
        type: 'stage'
      };

      move(moveDoc);
    }
  }

  remove(id) {
    this.props.removeDeal(id, () => this.props.closeModal());
  }

  copy() {
    const { deal } = this.props;

    // copied doc
    const doc = {
      ...deal,
      assignedUserIds: deal.assignedUsers.map(user => user._id),
      companyIds: deal.companies.map(company => company._id),
      customerIds: deal.customers.map(customer => customer._id)
    };

    this.props.saveDeal(doc, () => this.props.closeModal());
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
      <Fragment>
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
      </Fragment>
    );
  }

  render() {
    return (
      <Fragment>
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
      </Fragment>
    );
  }
}

export default DealEditForm;
