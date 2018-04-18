import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import Select from 'react-select-plus';
import {
  DataWithLoader,
  Button,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { ActivityList } from 'modules/activityLogs/components';
import { WhiteBox } from 'modules/layout/styles';
import { Alert } from 'modules/common/utils';
import { CompanySection } from 'modules/companies/components';
import { CustomerSection } from 'modules/customers/components';
import ServiceSection from './ServiceSection';
import { hasAnyActivity } from 'modules/customers/utils';
import { DealMove } from '../../containers';
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
  deal: PropTypes.object,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func.isRequired,
  stageId: PropTypes.string,
  users: PropTypes.array,
  length: PropTypes.number,
  dealActivityLog: PropTypes.array,
  loadingLogs: PropTypes.bool
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  move: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  __: PropTypes.func
};

class DealForm extends React.Component {
  constructor(props) {
    super(props);

    this.onTabClick = this.onTabClick.bind(this);
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

    const deal = props.deal || {};

    this.state = {
      stageId: deal.stageId,
      disabled: false,
      currentTab: 'activity',
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

  onChangeStage(stageId) {
    this.setState({ stageId });
  }

  onTabClick(currentTab) {
    this.setState({ currentTab });
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
    const { deal, stageId, length } = this.props;
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

      const stageId = this.state.stageId;

      doc = {
        name,
        companyIds: companies.map(company => company._id),
        customerIds: customers.map(customer => customer._id),
        closeDate: closeDate ? new Date(closeDate) : null,
        description: document.getElementById('description').value,
        productsData,
        stageId,
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

        if (deal) {
          // if changed stageId, update ui
          if (deal.stageId !== this.state.stageId) {
            const moveDoc = {
              source: { _id: deal.stageId, index: deal.order },
              destination: { _id: this.state.stageId, index: 0 },
              itemId: deal._id,
              type: 'stage'
            };

            this.context.move(moveDoc);
          }
        }

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

  renderTabContent() {
    const { currentTab } = this.state;
    const { dealActivityLog, deal, loadingLogs } = this.props;
    const { currentUser } = this.context;

    return (
      <div
        style={
          !hasAnyActivity(dealActivityLog)
            ? { position: 'relative', height: '400px' }
            : {}
        }
      >
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasAnyActivity(dealActivityLog) ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={dealActivityLog}
              target={deal.name}
              type={currentTab} //show logs filtered by type
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
      </div>
    );
  }

  renderTab() {
    const { deal } = this.props;
    const { currentTab } = this.state;
    const { __ } = this.context;

    return (
      <Left>
        <WhiteBox>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="edit-1" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="deal" contentTypeId={deal._id} />
        </WhiteBox>
        <Tabs grayBorder>
          <TabTitle
            className={currentTab === 'activity' ? 'active' : ''}
            onClick={() => this.onTabClick('activity')}
          >
            {__('Activity')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'notes' ? 'active' : ''}
            onClick={() => this.onTabClick('notes')}
          >
            {__('Notes')}
          </TabTitle>
        </Tabs>

        {this.renderTabContent()}
      </Left>
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

        <Button onClick={this.copy} icon="checked-1">
          Copy
        </Button>

        <Button icon="cancel-1" onClick={() => this.props.removeDeal(deal._id)}>
          Delete
        </Button>
      </Right>
    );
  }

  renderDealMove() {
    const { deal } = this.props;
    const { boardId, pipelineId } = this.context;

    return (
      <DealMove
        deal={deal}
        boardId={boardId}
        pipelineId={pipelineId}
        onChangeStage={this.onChangeStage}
      />
    );
  }

  renderFormContent() {
    const { deal, users } = this.props;
    const { closeDate, amount, assignedUserIds } = this.state;
    const { __ } = this.context;

    const nameField = name => (
      <HeaderContent>
        <ControlLabel>Name</ControlLabel>
        <FormControl id="name" defaultValue={name || ''} required />
      </HeaderContent>
    );

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

    // When add, only show name
    if (!deal) return nameField();

    const { name, description } = deal;

    return (
      <Fragment>
        <HeaderRow>
          {nameField(name)}

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
          {this.renderTab()}
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

DealForm.propTypes = propTypes;
DealForm.contextTypes = contextTypes;

export default DealForm;
