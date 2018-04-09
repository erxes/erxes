import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import Select from 'react-select-plus';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { CompanySection } from 'modules/companies/components';
import { CustomerSection } from 'modules/customers/components';
import ServiceSection from './ServiceSection';
import { DealMove, Tab } from '../../containers';
import { selectUserOptions } from '../../utils';
import {
  HeaderContentSmall,
  HeaderRow,
  HeaderContent,
  FormFooter,
  FormBody,
  Left,
  Right
} from '../../styles/deal';

const propTypes = {
  deal: PropTypes.object,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func,
  moveDeal: PropTypes.func,
  users: PropTypes.array,
  dealActivityLog: PropTypes.array,
  loadingLogs: PropTypes.bool
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class DealEditForm extends React.Component {
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
    this.copy = this.copy.bind(this);

    const deal = props.deal || {};

    this.state = {
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
    const { deal } = this.props;
    const {
      companies,
      customers,
      closeDate,
      productsData,
      assignedUserIds
    } = this.state;
    const { __ } = this.context;

    const name = document.getElementById('name').value;

    if (!name) {
      return Alert.error(__('Enter name'));
    }

    if (productsData.length === 0) {
      return Alert.error(__('Please, select product & service'));
    }

    const doc = {
      name,
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id),
      closeDate: closeDate ? new Date(closeDate) : null,
      description: document.getElementById('description').value,
      productsData,
      stageId: deal.stageId,
      assignedUserIds
    };

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

  copy() {
    const { deal } = this.props;

    // copied doc
    const doc = {
      ...deal,
      assignedUserIds: deal.assignedUsers.map(user => user._id),
      companyIds: deal.companies.map(company => company._id),
      customerIds: deal.customers.map(customer => customer._id)
    };

    this.props.saveDeal(doc, () => this.context.closeModal());
  }

  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return null;

    return (
      <HeaderContentSmall>
        <ControlLabel>Amount</ControlLabel>
        {Object.keys(amount).map(key => (
          <p key={key}>
            {amount[key].toLocaleString()} {key}
          </p>
        ))}
      </HeaderContentSmall>
    );
  }

  renderSidebar() {
    const { customers, companies, products, productsData } = this.state;
    const { deal } = this.props;

    return (
      <Right>
        <ServiceSection
          onChangeProductsData={this.onChangeProductsData}
          onChangeProducts={this.onChangeProducts}
          productsData={productsData}
          products={products}
          saveProductsData={this.saveProductsData}
        />

        <CompanySection
          name="Deal"
          companies={companies}
          onSelect={this.onChangeCompany}
        />

        <CustomerSection
          name="Deal"
          customers={customers}
          onSelect={this.onChangeCustomer}
        />

        <Button onClick={this.copy} icon="checkmark">
          Copy
        </Button>

        <Button icon="close" onClick={() => this.props.removeDeal(deal._id)}>
          Delete
        </Button>
      </Right>
    );
  }

  renderDealMove() {
    const { deal, moveDeal } = this.props;

    return <DealMove deal={deal} moveDeal={moveDeal} />;
  }

  renderFormContent() {
    const { deal, users } = this.props;
    const { closeDate, amount, assignedUserIds } = this.state;
    const { __ } = this.context;

    const { name, description } = deal;

    return (
      <div>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl id="name" defaultValue={name} required />
          </HeaderContent>

          {this.renderAmount(amount)}
        </HeaderRow>

        <HeaderRow>
          <HeaderContent>{this.renderDealMove()}</HeaderContent>

          <HeaderContentSmall>
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
          </HeaderContentSmall>
        </HeaderRow>

        <FormBody>
          <Left>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                id="description"
                componentClass="textarea"
                defaultValue={description}
              />
            </FormGroup>
          </Left>
          <Right>
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
          </Right>
        </FormBody>

        <FormBody>
          <Tab deal={deal} />
          {this.renderSidebar()}
        </FormBody>
      </div>
    );
  }

  render() {
    return (
      <Fragment>
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
            onClick={this.save}
          >
            Save
          </Button>
        </FormFooter>
      </Fragment>
    );
  }
}

DealEditForm.propTypes = propTypes;
DealEditForm.contextTypes = contextTypes;

export default DealEditForm;
