import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
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
import { DealFormContainer, DealButton, DealFormAmount } from '../../styles';
import { ProductForm, ItemCounter } from '../';
import { selectUserOptions } from '../../utils';

const propTypes = {
  deal: PropTypes.object,
  close: PropTypes.func.isRequired,
  saveDeal: PropTypes.func.isRequired,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
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
    this.onChangeUsers = this.onChangeUsers.bind(this);
    this.saveProductsData = this.saveProductsData.bind(this);
    this.save = this.save.bind(this);

    const deal = props.deal || {};

    this.state = {
      amount: deal.amount || {},
      // Deal datas
      companies: deal.companies || [],
      customers: deal.customers || [],
      closeDate: deal.closeDate,
      note: deal.note,
      productsData: (deal.productsData || []).map(data => ({ ...data })),
      products: deal.products || [],
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

  onChangeNote(e) {
    this.setState({ note: e.target.value });
  }

  onChangeUsers(users) {
    this.setState({
      assignedUserIds: users.map(user => user.value)
    });
  }

  saveProductsData() {
    const productsData = this.state.productsData;
    const products = [];
    const amount = {};

    const filteredProductsData = [];

    productsData.forEach(el => {
      // products
      if (el.product && el.currency && el.quantity && el.unitPrice) {
        // if don't add before, push to array
        if (!products.find(pEl => pEl._id === el.product._id)) {
          products.push(el.product);
        }

        // amount
        if (!amount[el.currency]) amount[el.currency] = el.amount;
        else amount[el.currency] += el.amount;

        filteredProductsData.push(el);
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

    if (!closeDate) {
      return Alert.error(__('Please, select a close date'));
    }

    const productIds = [];

    productsData.forEach(el => {
      if (!productIds.find(pEl => pEl === el.product._id)) {
        productIds.push(el.product._id);
      }
    });

    const { deal, boardId, pipelineId, stageId, dealsLength } = this.props;

    const doc = {
      companyIds: companies.map(company => company._id),
      customerIds: customers.map(customer => customer._id),
      closeDate: new Date(closeDate),
      productIds,
      productsData,
      assignedUserIds,
      boardId: deal ? deal.boardId : boardId,
      pipelineId: deal ? deal.pipelineId : pipelineId,
      stageId: deal ? deal.stageId : stageId,
      order: deal ? deal.order : dealsLength
    };

    if (note) doc.note = note;

    this.props.saveDeal(doc, () => this.props.close(), this.props.deal);
  }

  renderProductModal(productsData) {
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
          productsData={productsData}
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
          {Object.keys(amount).map(el => (
            <p key={el}>
              {amount[el].toLocaleString()} {el}
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
        <form>
          {this.renderProductModal(productsData)}

          <FormGroup>
            <ItemCounter items={products} />
          </FormGroup>

          {this.renderCompanyModal(companies)}

          <FormGroup>
            <ItemCounter items={companies} />
          </FormGroup>

          {this.renderCustomerModal(customers)}

          <FormGroup>
            <ItemCounter items={customers} />
          </FormGroup>

          {this.renderAmount(amount)}

          <FormGroup>
            <ControlLabel>Close date</ControlLabel>
            <Datetime
              inputProps={{ placeholder: __('Click to select a date') }}
              dateFormat="YYYY/MM/DD"
              timeFormat={false}
              value={closeDate}
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

          <Modal.Footer>
            <Button
              btnStyle="simple"
              onClick={() => {
                this.props.close();
              }}
              icon="close"
            >
              Close
            </Button>

            <Button
              btnStyle="success"
              onClick={() => {
                this.save();
              }}
              icon="checkmark"
            >
              Save
            </Button>
          </Modal.Footer>
        </form>
      </DealFormContainer>
    );
  }
}

DealForm.propTypes = propTypes;
DealForm.contextTypes = {
  __: PropTypes.func
};

export default DealForm;
