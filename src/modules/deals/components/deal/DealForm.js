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
import { Alert, renderFullName } from 'modules/common/utils';
import { CompanyAssociate } from 'modules/companies/containers';
import { CustomerAssociate } from 'modules/customers/containers';
import {
  DealFormContainer,
  DealButton,
  DealFormAmount,
  DealProducts
} from '../../styles';
import { ProductForm, DealProduct } from '../';
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
      company: deal.company,
      customer: deal.customer,
      closeDate: deal.closeDate,
      note: deal.note,
      productsData: deal.productsData.map(data => ({ ...data })),
      products: deal.products || [],
      assignedUserIds: deal.assignedUsers
        ? deal.assignedUsers.map(el => el['_id'])
        : []
    };
  }

  save() {
    const {
      customer,
      company,
      closeDate,
      productsData,
      note,
      assignedUserIds
    } = this.state;

    if (!company) {
      return Alert.error('Choose a company');
    }

    if (!customer) {
      return Alert.error('Choose a customer');
    }

    if (!closeDate) {
      return Alert.error('Select a close date');
    }

    const productIds = [];

    productsData.forEach(el => {
      if (!productIds.find(pEl => pEl === el.product._id)) {
        productIds.push(el.product._id);
      }
    });

    const { deal, boardId, pipelineId, stageId, dealsLength } = this.props;

    const doc = {
      companyId: company._id,
      customerId: customer._id,
      closeDate: new Date(closeDate),
      productIds,
      productsData,
      assignedUserIds,
      boardId: deal ? deal.boardId : boardId,
      pipelineId: deal ? deal.pipelineId : pipelineId,
      stageId: deal ? deal.stageId : stageId,
      order: deal ? deal.order : dealsLength
    };

    if (note) {
      doc.note = note;
    }

    this.props.saveDeal(
      doc,
      () => {
        this.props.close();
      },
      this.props.deal
    );
  }

  onChangeCompany(companies) {
    if (companies && companies.length === 1) {
      const company = companies[0];

      if (company !== this.state.company) {
        this.setState({ customer: null });
      }

      this.setState({ company });
    } else {
      this.setState({ company: null, customer: null });
    }
  }

  onChangeCustomer(customers) {
    if (customers && customers.length === 1) {
      this.setState({ customer: customers[0] });
    } else {
      this.setState({ customer: null });
    }
  }

  onDateInputChange(date) {
    this.setState({ closeDate: date });
  }

  onChangeProductsData(productsData) {
    this.setState({ productsData });
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

  onChangeNote(e) {
    this.setState({ note: e.target.value });
  }

  onChangeUsers(users) {
    const assignedUserIds = [];

    users.forEach(el => assignedUserIds.push(el.value));

    this.setState({
      assignedUserIds
    });
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
        size="large"
      >
        <ProductForm
          onChangeProductsData={this.onChangeProductsData}
          productsData={productsData}
          saveProductsData={this.saveProductsData}
        />
      </ModalTrigger>
    );
  }

  renderCompanyModal(company) {
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
        <CompanyAssociate
          data={{ firstName: 'Deal', companies: company ? [company] : [] }}
          save={this.onChangeCompany}
          limit={1}
        />
      </ModalTrigger>
    );
  }

  renderCompany(company) {
    if (!company) return null;

    return (
      <FormGroup>
        <DealProducts>
          <ul>
            <li>{company.name}</li>
          </ul>
        </DealProducts>
      </FormGroup>
    );
  }

  renderCustomerModal(company, customer) {
    if (!company) return null;

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
        <CustomerAssociate
          data={{
            name: company.name,
            customers: customer ? [customer] : []
          }}
          companyId={company._id}
          save={this.onChangeCustomer}
          limit={1}
        />
      </ModalTrigger>
    );
  }

  renderCustomer(customer) {
    if (!customer) return null;

    return (
      <FormGroup>
        <DealProducts>
          <ul>
            <li>{renderFullName(customer)}</li>
          </ul>
        </DealProducts>
      </FormGroup>
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
      company,
      customer,
      assignedUserIds,
      closeDate,
      products,
      productsData,
      amount
    } = this.state;

    return (
      <DealFormContainer>
        <form>
          {this.renderProductModal(productsData)}
          <FormGroup>
            <DealProduct products={products} />
          </FormGroup>
          {this.renderCompanyModal(company)}
          {this.renderCompany(company)}
          {this.renderCustomerModal(company, customer)}
          {this.renderCustomer(customer)}
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
              onChange={this.onChangeNote.bind(this)}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Assigned to</ControlLabel>
            <Select
              placeholder={__('Choose users')}
              value={assignedUserIds}
              onChange={value => this.onChangeUsers(value)}
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
