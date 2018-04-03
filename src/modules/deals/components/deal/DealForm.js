import React from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import Select from 'react-select-plus';
import {
  DataWithLoader,
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
import { ActivityList } from 'modules/activityLogs/components';
import { Sidebar } from 'modules/layout/components';
import { WhiteBox } from 'modules/layout/styles';
import { Alert } from 'modules/common/utils';
import { CompanySection } from 'modules/companies/components';
import { CustomerSection } from 'modules/customers/components';
import { hasAnyActivity } from 'modules/customers/utils';
import { DealMove } from '../../containers';
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
  removeDeal: PropTypes.func.isRequired,
  moveDeal: PropTypes.func,
  stageId: PropTypes.string,
  users: PropTypes.array,
  length: PropTypes.number,
  dealActivityLog: PropTypes.array,
  loadingLogs: PropTypes.bool
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  __: PropTypes.func
};

class DealForm extends React.Component {
  constructor(props) {
    super(props);

    this.onTabClick = this.onTabClick.bind(this);
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

      doc = {
        name,
        companyIds: companies.map(company => company._id),
        customerIds: customers.map(customer => customer._id),
        closeDate: closeDate ? new Date(closeDate) : null,
        description: document.getElementById('description').value,
        productsData,
        stageId: deal.stageId,
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
        <div>
          <WhiteBox>
            <Tabs>
              <TabTitle className="active">
                <Icon icon="compose" /> {__('New note')}
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
        </div>
      </Left>
    );
  }

  renderSidebar() {
    const { customers, companies } = this.state;
    const { deal } = this.props;

    return (
      <Right>
        <Sidebar>
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

          <Button onClick={this.copy} icon="android-folder-open">
            Copy
          </Button>

          <Button
            icon="android-delete"
            onClick={() => this.props.removeDeal(deal._id)}
          >
            Delete
          </Button>
        </Sidebar>
      </Right>
    );
  }

  renderDealMove() {
    const { deal, moveDeal } = this.props;
    const { boardId, pipelineId } = this.context;

    return (
      <DealMove
        deal={deal}
        boardId={boardId}
        pipelineId={pipelineId}
        moveDeal={moveDeal}
      />
    );
  }

  renderFormContent() {
    const { deal, users } = this.props;
    const {
      assignedUserIds,
      closeDate,
      products,
      productsData,
      amount
    } = this.state;
    const { __ } = this.context;

    const nameField = name => (
      <FormGroup>
        <ControlLabel>Name</ControlLabel>
        <FormControl id="name" defaultValue={name || ''} required />
      </FormGroup>
    );

    // When add, only show name
    if (!deal) return nameField();

    const { name, description } = deal;

    return (
      <div>
        {this.renderDealMove()}

        {nameField(name)}

        {this.renderProductModal(productsData, products)}

        <FormGroup>
          <ItemCounter items={products} show />
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
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="description"
            componentClass="textarea"
            defaultValue={description}
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
          {this.renderTab()}
          {this.renderSidebar()}
        </FormBody>
      </div>
    );
  }

  render() {
    return (
      <FormContainer>
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
      </FormContainer>
    );
  }
}

DealForm.propTypes = propTypes;
DealForm.contextTypes = contextTypes;

export default DealForm;
