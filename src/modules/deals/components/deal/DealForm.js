import React from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import Select from 'react-select-plus';
import {
  Button,
  ModalTrigger,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { CompanyChooser } from 'modules/companies/containers';
import { CustomerChooser } from 'modules/customers/containers';
import {
  DealFormContainer,
  DealButton,
  DealFormAmount,
  Footer
} from '../../styles';
import { ProductForm, ItemCounter } from '../';
import { selectUserOptions } from '../../utils';

const propTypes = {
  deal: PropTypes.object,
  close: PropTypes.func.isRequired,
  saveDeal: PropTypes.func.isRequired,
  stageId: PropTypes.string,
  users: PropTypes.array,
  dealsLength: PropTypes.number
};

class DealForm extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeCompany = this.onChangeCompany.bind(this);
    this.onChangeCustomer = this.onChangeCustomer.bind(this);
    this.onDateInputChange = this.onDateInputChange.bind(this);
    this.onChangeProductsData = this.onChangeProductsData.bind(this);
    this.onChangeProducts = this.onChangeProducts.bind(this);
    this.onChangeUsers = this.onChangeUsers.bind(this);
    this.saveProductsData = this.saveProductsData.bind(this);
    this.save = this.save.bind(this);

    const deal = props.deal || {};

    this.state = {
      disabled: false,
      amount: deal.amount || {},
      // Deal datas
      companies: deal.companies || [],
      customers: deal.customers || [],
      closeDate: deal.closeDate,
      note: deal.note || '',
      productsData: deal.products ? deal.products.map(p => ({ ...p })) : [],
      // collecting data for ItemCounter component
      products: deal.products ? deal.products.map(p => p.product) : [],
      assignedUserIds: (deal.assignedUsers || []).map(user => user._id)
    };
  }

  onChangeCompany(companies) {
    this.setState({ companies });
  }

  onChangeCustomer(customers) {
    this.setState({ customers });
  }

  onDateInputChange(closeDate) {
    this.setState({ closeDate });
  }

  onChangeProductsData(productsData) {
    this.setState({ productsData });
  }

  onChangeProducts(products) {
    this.setState({ products });
  }

  onChangeNote(e) {
    this.setState({ note: e.target.value });
  }

  onChangeUsers(users) {
    this.setState({ assignedUserIds: users.map(user => user.value) });
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
      companies,
      customers,
      closeDate,
      productsData,
      note,
      assignedUserIds
    } = this.state;

    const { __ } = this.context;

    if (productsData.length === 0) {
      return Alert.error(__('Please, select product & service'));
    }

    const { deal, stageId, dealsLength } = this.props;

    const doc = {
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id),
      closeDate: closeDate ? new Date(closeDate) : null,
      note,
      productsData,
      assignedUserIds,
      stageId: deal ? deal.stageId : stageId,
      order: deal ? deal.order : dealsLength
    };

    // before save, disable save button
    this.setState({ disabled: true });

    this.props.saveDeal(
      doc,
      () => {
        // after save, enable save button
        this.setState({ disabled: false });

        this.props.close();
      },
      this.props.deal
    );
  }

  renderProductModal(productsData, products) {
    const { __ } = this.context;

    const productTrigger = (
      <DealButton>
        {__('Product & Service')} <Icon icon="plus" />
      </DealButton>
    );

    return (
      <ModalTrigger
        title="New Product & Service"
        trigger={productTrigger}
        dialogClassName="full"
      >
        <ProductForm
          onChangeProductsData={this.onChangeProductsData}
          onChangeProducts={this.onChangeProducts}
          productsData={productsData}
          products={products}
          saveProductsData={this.saveProductsData}
        />
      </ModalTrigger>
    );
  }

  renderCompanyModal(companies) {
    const { __ } = this.context;

    const companyTrigger = (
      <DealButton>
        {__('Choose a company')} <Icon icon="plus" />
      </DealButton>
    );

    return (
      <ModalTrigger
        size="large"
        title="Select company"
        trigger={companyTrigger}
      >
        <CompanyChooser
          data={{ firstName: 'Deal', companies }}
          onSelect={this.onChangeCompany}
        />
      </ModalTrigger>
    );
  }

  renderCustomerModal(customers) {
    const { __ } = this.context;

    const customerTrigger = (
      <DealButton>
        {__('Choose a customer')} <Icon icon="plus" />
      </DealButton>
    );

    return (
      <ModalTrigger
        size="large"
        title="Select customer"
        trigger={customerTrigger}
      >
        <CustomerChooser
          data={{ name: 'Deal', customers }}
          onSelect={this.onChangeCustomer}
        />
      </ModalTrigger>
    );
  }

  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return null;

    return (
      <FormGroup>
        <ControlLabel>Amount</ControlLabel>
        <DealFormAmount>
          {Object.keys(amount).map(key => (
            <p key={key}>
              {amount[key].toLocaleString()} {key}
            </p>
          ))}
        </DealFormAmount>
      </FormGroup>
    );
  }

  render() {
    const { __ } = this.context;
    const { users } = this.props;
    const {
      companies,
      customers,
      assignedUserIds,
      closeDate,
      products,
      productsData,
      amount,
      note
    } = this.state;

    return (
      <DealFormContainer>
        {this.renderProductModal(productsData, products)}

        <FormGroup>
          <ItemCounter items={products} show />
        </FormGroup>

        {this.renderCompanyModal(companies)}

        <FormGroup>
          <ItemCounter items={companies} show />
        </FormGroup>

        {this.renderCustomerModal(customers)}

        <FormGroup>
          <ItemCounter items={customers} show />
        </FormGroup>

        {this.renderAmount(amount)}

        <FormGroup>
          <ControlLabel>Close date</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __('Click to select a date') }}
            dateFormat="YYYY/MM/DD"
            timeFormat={false}
            value={closeDate}
            closeOnSelect
            onChange={this.onDateInputChange.bind(this)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Note</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={note}
            onChange={this.onChangeNote.bind(this)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Assigned to</ControlLabel>
          <Select
            placeholder={__('Choose users')}
            value={assignedUserIds}
            onChange={this.onChangeUsers}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            multi
            removeSelected={true}
            options={selectUserOptions(users)}
          />
        </FormGroup>

        <Footer>
          <Button
            btnStyle="simple"
            onClick={() => this.props.close()}
            icon="close"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            onClick={this.save}
            icon="checkmark"
          >
            Save
          </Button>
        </Footer>
      </DealFormContainer>
    );
  }
}

DealForm.propTypes = propTypes;
DealForm.contextTypes = {
  __: PropTypes.func
};

export default DealForm;
