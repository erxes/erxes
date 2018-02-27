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
import { DealFormContainer, DealButton, DealFormAmount } from '../../styles';
import { ProductForm, DealProduct } from '../';
import {
  selectOptions,
  selectCustomerOptions,
  selectUserOptions
} from '../../utils';

const propTypes = {
  deal: PropTypes.object,
  saveDeal: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  companies: PropTypes.array,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  stageId: PropTypes.string,
  users: PropTypes.array,
  products: PropTypes.array,
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

    this.saveDeal = this.saveDeal.bind(this);

    this.state = {
      companyId: '',
      customerId: '',
      customers: [],
      closeDate: null,
      note: '',
      amount: {},
      productsData: [],
      products: [],
      assignedUserIds: []
    };
  }

  saveDeal(e) {
    e.preventDefault();

    const {
      customerId,
      companyId,
      closeDate,
      productsData,
      note,
      assignedUserIds
    } = this.state;

    const { boardId, pipelineId, stageId, dealsLength } = this.props;

    const productIds = [];
    const filteredProductsData = [];

    productsData.forEach(p => {
      if (p.productId) {
        productIds.push(p.productId);
        filteredProductsData.push(p);
      }
    });

    const deal = {
      boardId,
      pipelineId,
      stageId,
      companyId,
      customerId,
      closeDate: new Date(closeDate),
      productIds,
      productsData: filteredProductsData,
      note,
      assignedUserIds,
      order: dealsLength
    };

    console.log('deal: ', deal);

    this.props.saveDeal(
      {
        doc: deal
      },
      () => {
        this.props.refetch();
        this.props.close();
      },
      this.props.deal
    );
  }

  onChangeCompany(company) {
    if (company) {
      const companyId = company.value;

      const customers = this.props.companies.find(
        company => company._id === companyId
      ).customers;

      this.setState({ companyId, customers });
    } else {
      this.setState({ companyId: '', customerId: '', customers: [] });
    }
  }

  onChangeCustomer(customer) {
    this.setState({ customerId: customer ? customer.value : '' });
  }

  onDateInputChange(date) {
    this.setState({ closeDate: date });
  }

  onChangeProductsData(productsData) {
    const products = [];
    const amount = {};

    productsData.forEach(el => {
      // products
      this.props.products.forEach(pEl => {
        if (pEl._id === el.productId) {
          products.push({
            _id: pEl._id,
            name: pEl.name
          });
        }
      });

      // amount
      if (!amount[el.currency]) amount[el.currency] = el.amount;
      else amount[el.currency] += el.amount;
    });

    this.setState({ productsData, products, amount });
  }

  onChangeProducts(products) {
    this.setState({ products });
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

  render() {
    const productTrigger = (
      <DealButton>
        Select Product & Service <Icon icon="plus" />
      </DealButton>
    );

    const { companies, users } = this.props;
    const {
      customers,
      companyId,
      assignedUserIds,
      customerId,
      closeDate,
      products,
      productsData,
      amount
    } = this.state;

    return (
      <DealFormContainer>
        <form onSubmit={e => this.saveDeal(e)}>
          <ModalTrigger
            size="large"
            title="New Product & Service"
            trigger={productTrigger}
          >
            <ProductForm
              onChangeProductsData={this.onChangeProductsData}
              productsData={productsData}
              products={this.props.products}
            />
          </ModalTrigger>
          <FormGroup>
            <DealProduct products={products} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Company</ControlLabel>
            <Select
              placeholder="Choose company"
              value={companyId}
              onChange={value => this.onChangeCompany(value)}
              optionRenderer={option => (
                <div className="simple-option">
                  <span>{option.label}</span>
                </div>
              )}
              options={selectOptions(companies)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Customer</ControlLabel>
            <Select
              placeholder="Choose customer"
              value={customerId}
              onChange={value => this.onChangeCustomer(value)}
              optionRenderer={option => (
                <div className="simple-option">
                  <span>{option.label}</span>
                </div>
              )}
              options={selectCustomerOptions(customers)}
            />
          </FormGroup>
          {Object.keys(amount).length !== 0 ? (
            <FormGroup>
              <ControlLabel>Amount</ControlLabel>
              <DealFormAmount>
                {Object.keys(amount).map(el => (
                  <p key={el}>
                    {amount[el]} {el}
                  </p>
                ))}
              </DealFormAmount>
            </FormGroup>
          ) : null}
          <FormGroup>
            <ControlLabel>Close date</ControlLabel>
            <Datetime
              inputProps={{ placeholder: 'Click to select a date' }}
              dateFormat="YYYY/MM/DD"
              timeFormat={false}
              value={closeDate}
              onChange={this.onDateInputChange.bind(this)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Note</ControlLabel>
            <FormControl
              placeholder="Note"
              componentClass="textarea"
              onChange={this.onChangeNote.bind(this)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Assigned to</ControlLabel>
            <Select
              placeholder="Choose users"
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

            <Button btnStyle="success" type="submit" icon="checkmark">
              Save
            </Button>
          </Modal.Footer>
        </form>
      </DealFormContainer>
    );
  }
}

DealForm.propTypes = propTypes;

export default DealForm;
