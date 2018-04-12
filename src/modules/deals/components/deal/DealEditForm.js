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
  FlexContent,
  Left,
  Right,
  Avatar,
  SelectValue,
  SelectOption
} from '../../styles/deal';

const propTypes = {
  deal: PropTypes.object.isRequired,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func,
  users: PropTypes.array,
  dealActivityLog: PropTypes.array,
  loadingLogs: PropTypes.bool,
  index: PropTypes.number
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  move: PropTypes.func,
  currentUser: PropTypes.object,
  __: PropTypes.func
};

class DealEditForm extends React.Component {
  constructor(props) {
    super(props);

    this.onTabClick = this.onTabClick.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onChangeStage = this.onChangeStage.bind(this);
    this.onChangeCompany = this.onChangeCompany.bind(this);
    this.onChangeCustomer = this.onChangeCustomer.bind(this);
    this.onDateInputChange = this.onDateInputChange.bind(this);
    this.onChangeProductsData = this.onChangeProductsData.bind(this);
    this.onChangeProducts = this.onChangeProducts.bind(this);
    this.onChangeUsers = this.onChangeUsers.bind(this);
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

  onTabClick(currentTab) {
    this.setState({ currentTab });
  }

  onChangeInput(e) {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  }

  onChangeStage(stageId) {
    this.setState({ stageId });
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
      name,
      description,
      companies,
      customers,
      closeDate,
      productsData,
      assignedUserIds
    } = this.state;
    const { __ } = this.context;

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
      description,
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

        const { move } = this.context;

        // if changed stageId, update ui
        if (move && deal.stageId !== this.state.stageId) {
          const moveDoc = {
            source: { _id: deal.stageId, index: this.props.index },
            destination: { _id: this.state.stageId, index: 0 },
            itemId: deal._id,
            type: 'stage'
          };

          move(moveDoc);
        }
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
    const { deal } = this.props;

    return <DealMove deal={deal} onChangeStage={this.onChangeStage} />;
  }

  renderFormContent() {
    const { deal, users } = this.props;
    const {
      name,
      description,
      closeDate,
      amount,
      assignedUserIds
    } = this.state;
    const { __ } = this.context;

    const userValue = option => (
      <SelectValue>
        <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
        {option.label}
      </SelectValue>
    );

    const userOption = option => (
      <SelectOption className="simple-option">
        <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
        <span>{option.label}</span>
      </SelectOption>
    );

    return (
      <Fragment>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              name="name"
              defaultValue={name}
              required
              onChange={this.onChangeInput}
            />
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

        <FlexContent>
          <Left>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                name="description"
                componentClass="textarea"
                defaultValue={description}
                onChange={this.onChangeInput}
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
                optionRenderer={userOption}
                valueRenderer={userValue}
                removeSelected={true}
                options={selectUserOptions(users)}
                multi
              />
            </FormGroup>
          </Right>
        </FlexContent>

        <FlexContent>
          <Tab deal={deal} />
          {this.renderSidebar()}
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
            onClick={this.context.closeModal}
            icon="close"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checkmark"
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
