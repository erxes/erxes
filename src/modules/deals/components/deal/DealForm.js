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
  ControlLabel,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { Sidebar } from 'modules/layout/components';
import { WhiteBox } from 'modules/layout/styles';
import { Alert } from 'modules/common/utils';
import { CompanyChooser } from 'modules/companies/containers';
import { CustomerChooser } from 'modules/customers/containers';
import { ProductForm, ItemCounter } from '../';
import { selectUserOptions } from '../../utils';
import {
  Button as DealButton,
  FormAmount,
  FormContainer,
  FormFooter,
  FormBody,
  Left,
  Right
} from '../../styles/deal';

const propTypes = {
  deal: PropTypes.object,
  saveDeal: PropTypes.func.isRequired,
  stageId: PropTypes.string,
  users: PropTypes.array,
  length: PropTypes.number
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
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

  save(e) {
    e.preventDefault();

    const { deal, stageId, length } = this.props;
    const {
      companies,
      customers,
      closeDate,
      productsData,
      note,
      assignedUserIds
    } = this.state;
    const { __ } = this.context;

    const name = document.getElementById('name').value;

    let doc = {
      name,
      stageId,
      order: length
    };

    // edit
    if (deal) {
      if (productsData.length === 0) {
        return Alert.error(__('Please, select product & service'));
      }

      doc = {
        name,
        companyIds: companies.map(company => company._id),
        customerIds: customers.map(customer => customer._id),
        closeDate: closeDate ? new Date(closeDate) : null,
        note,
        productsData,
        assignedUserIds
      };
    }

    // before save, disable save button
    this.setState({ disabled: true });

    this.props.saveDeal(
      doc,
      () => {
        // after save, enable save button
        this.setState({ disabled: false });

        this.context.closeModal();
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
        <FormAmount>
          {Object.keys(amount).map(key => (
            <p key={key}>
              {amount[key].toLocaleString()} {key}
            </p>
          ))}
        </FormAmount>
      </FormGroup>
    );
  }

  renderTab() {
    const { deal } = this.props;
    const { __ } = this.context;

    return (
      <WhiteBox>
        <Tabs>
          <TabTitle className="active">
            <Icon icon="compose" /> {__('New note')}
          </TabTitle>
        </Tabs>

        <NoteForm contentType="deal" contentTypeId={deal._id} />
      </WhiteBox>
    );
  }

  renderSidebar() {
    return <Sidebar />;
  }

  renderFormContent() {
    const { deal, users } = this.props;
    const {
      companies,
      customers,
      assignedUserIds,
      closeDate,
      products,
      productsData,
      amount,
      note,
      name
    } = this.state;
    const { __ } = this.context;

    const nameField = (
      <FormGroup>
        <ControlLabel>Name</ControlLabel>
        <FormControl id="name" value={name} required />
      </FormGroup>
    );

    // When add, only show name
    if (!deal) return nameField;

    return (
      <div>
        {nameField}

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

        <FormBody>
          <Left>{this.renderTab()}</Left>
          <Right>{this.renderSidebar()}</Right>
        </FormBody>
      </div>
    );
  }

  render() {
    return (
      <FormContainer onSubmit={e => this.save(e)}>
        {this.renderFormContent()}

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.context.closeModal}
            icon="close"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checkmark"
            type="submit"
          >
            Save
          </Button>
        </FormFooter>
      </FormContainer>
    );
  }
}

DealForm.propTypes = propTypes;
DealForm.contextTypes = contextTypes;

export default DealForm;
