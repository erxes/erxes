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

    this.onChangeField = this.onChangeField.bind(this);
    this.changeStage = this.changeStage.bind(this);
    this.onTabClick = this.onTabClick.bind(this);
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

  onChangeField(name, value) {
    this.setState({ [name]: value });
  }

  changeStage(stageId) {
    this.setState({ stageId });

    const { move } = this.context;
    const { deal } = this.props;

    // if changed stageId, update ui
    if (move && deal.stageId !== stageId) {
      const moveDoc = {
        source: { _id: deal.stageId, index: this.props.index },
        destination: { _id: stageId, index: 0 },
        itemId: deal._id,
        type: 'stage'
      };

      move(moveDoc, true);
    }
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

  remove(_id) {
    this.props.removeDeal(_id, () => this.context.closeModal());
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
          onChangeProductsData={productsData =>
            this.onChangeField('productsData', productsData)
          }
          onChangeProducts={products =>
            this.onChangeField('products', products)
          }
          productsData={productsData}
          products={products}
          saveProductsData={this.saveProductsData}
        />

        <CompanySection
          name="Deal"
          companies={companies}
          onSelect={companies => this.onChangeField('companies', companies)}
        />

        <CustomerSection
          name="Deal"
          customers={customers}
          onSelect={customers => this.onChangeField('customers', customers)}
        />

        <Button onClick={this.copy} icon="checkmark">
          Copy
        </Button>

        <Button icon="close" onClick={() => this.remove(deal._id)}>
          Delete
        </Button>
      </Right>
    );
  }

  renderDealMove() {
    const { deal } = this.props;

    return <DealMove deal={deal} changeStage={this.changeStage} />;
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
              defaultValue={name}
              required
              onChange={e => this.onChangeField('name', e.target.value)}
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
                onChange={closeDate =>
                  this.onChangeField('closeDate', closeDate)
                }
              />
            </FormGroup>
          </HeaderContentSmall>
        </HeaderRow>

        <FlexContent>
          <Left>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                componentClass="textarea"
                defaultValue={description}
                onChange={e =>
                  this.onChangeField('description', e.target.value)
                }
              />
            </FormGroup>
          </Left>
          <Right>
            <FormGroup>
              <ControlLabel>Assigned to</ControlLabel>
              <Select
                placeholder={__('Choose users')}
                value={assignedUserIds}
                onChange={users =>
                  this.onChangeField(
                    'assignedUserIds',
                    users.map(user => user.value)
                  )
                }
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
