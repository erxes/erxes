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
import {
  Alert,
  renderFullName,
  listObjectUnFreeze
} from 'modules/common/utils';
import { CompanyAssociate } from 'modules/companies/containers';
import { CustomerAssociate } from '../../containers';
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
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
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
      amount: {},
      // Deal datas
      company: deal.company,
      customer: deal.customer,
      closeDate: deal.closeDate,
      note: deal.note,
      productsData: listObjectUnFreeze(deal.productsData),
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
      Alert.error('Choose a company');
      return;
    }

    if (!customer) {
      Alert.error('Choose a customer');
      return;
    }

    if (!closeDate) {
      Alert.error('Select a close date');
      return;
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

    this.props.save(
      doc,
      () => {
        this.props.refetch();
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

  render() {
    const { __ } = this.context;
    const productTrigger = (
      <DealButton>
        {__('Product & Service')} <Icon icon="plus" />
      </DealButton>
    );

    const companyTrigger = (
      <DealButton>
        {__('Choose a company')} <Icon icon="plus" />
      </DealButton>
    );

    const customerTrigger = (
      <DealButton>
        {__('Choose a customer')} <Icon icon="plus" />
      </DealButton>
    );

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
          <FormGroup>
            <DealProduct products={products} />
          </FormGroup>
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
          {company ? (
            <FormGroup>
              <DealProducts>
                <ul>
                  <li>{company.name}</li>
                </ul>
              </DealProducts>
            </FormGroup>
          ) : null}
          {company ? (
            <ModalTrigger
              size="large"
              title="Select customer"
              trigger={customerTrigger}
            >
              <CustomerAssociate
                data={{
                  companyId: company._id,
                  customers: customer ? [customer] : []
                }}
                companyId={company._id}
                save={this.onChangeCustomer}
                limit={1}
              />
            </ModalTrigger>
          ) : null}
          {customer ? (
            <FormGroup>
              <DealProducts>
                <ul>
                  <li>{renderFullName(customer)}</li>
                </ul>
              </DealProducts>
            </FormGroup>
          ) : null}
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

export default DealForm;
