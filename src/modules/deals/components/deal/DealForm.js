import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Datetime from 'react-datetime';
import {
  Button,
  ModalTrigger,
  Icon,
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { DealFormContainer, DealButton } from '../../styles';
import { ProductForm } from '../';

const propTypes = {
  deal: PropTypes.object,
  saveDeal: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  companies: PropTypes.array,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  stageId: PropTypes.string
};

class DealForm extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeCompany = this.onChangeCompany.bind(this);
    this.onChangeCustomer = this.onChangeCustomer.bind(this);
    this.onDateInputChange = this.onDateInputChange.bind(this);
    this.onChangeProductsData = this.onChangeProductsData.bind(this);

    this.saveDeal = this.saveDeal.bind(this);

    this.state = {
      companyId: '',
      customerId: '',
      customers: [],
      closeDate: '',
      note: 'Note',
      productsData: []
    };
  }

  saveDeal(e) {
    e.preventDefault();

    const { customerId, companyId, closeDate, productsData, note } = this.state;
    const { boardId, pipelineId, stageId } = this.props;

    const productIds = [];
    const filteredProductsData = [];

    productsData.forEach(p => {
      if (p.productId) {
        productIds.push(p.productId);
        filteredProductsData.push(p);
      }
    });

    this.props.saveDeal(
      {
        doc: {
          boardId,
          pipelineId,
          stageId,
          companyId,
          customerId,
          closeDate: new Date(closeDate),
          productIds,
          productsData: filteredProductsData,
          note
        }
      },
      () => {
        this.props.close();
      },
      this.props.deal
    );
  }

  onChangeCompany(e) {
    const companyId = e.target.value;
    const customers = this.props.companies.find(
      company => company._id === companyId
    ).customers;

    this.setState({ companyId, customers });
  }

  onChangeCustomer(e) {
    const customerId = e.target.value;

    this.setState({ customerId });
  }

  onDateInputChange(date) {
    this.setState({ closeDate: date });
  }

  onChangeProductsData(productsData) {
    this.setState({ productsData });
  }

  render() {
    const productTrigger = (
      <DealButton>
        Select Product & Service <Icon icon="plus" />
      </DealButton>
    );

    const { companies } = this.props;
    const { customers, customer, company, closeDate } = this.state;

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
              productsData={this.state.productsData}
            />
          </ModalTrigger>
          <FormGroup>
            <ControlLabel>Company</ControlLabel>
            <FormControl
              componentClass="select"
              value={company}
              onChange={this.onChangeCompany}
            >
              <option />
              {companies.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Customer</ControlLabel>
            <FormControl
              componentClass="select"
              value={customer}
              onChange={this.onChangeCustomer}
            >
              <option />
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
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
