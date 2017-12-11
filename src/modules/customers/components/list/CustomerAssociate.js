import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  Icon,
  FormControl,
  ModalTrigger
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { CustomerForm } from '../';
import {
  FormWrapper,
  InputsWrapper,
  ListWrapper,
  Footer,
  TitleSpan,
  LoadMore
} from 'modules/companies/styles';

const propTypes = {
  company: PropTypes.object.isRequired,
  customers: PropTypes.array.isRequired,
  addCustomer: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CustomeAssociate extends React.Component {
  constructor(props) {
    super(props);
    const companyCustomers = this.props.company.customers || [];

    this.state = {
      companyCustomers,
      searchValue: ''
    };

    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.search = this.search.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  save() {
    const { companyCustomers } = this.state;
    const customerIds = [];

    companyCustomers.forEach(company => {
      customerIds.push(company._id.toString());
    });

    const doc = {
      customerIds
    };

    this.props.save(doc);
    this.context.closeModal();
  }

  componentWillUnmount() {
    this.props.search('');
  }

  handleChange(customer, type) {
    const { companyCustomers } = this.state;

    if (type === 'addToCompany') {
      if (companyCustomers.some(item => item._id === customer._id))
        return Alert.warning('Already added');
      this.setState({
        companyCustomers: [...companyCustomers, customer]
      });
    } else {
      this.setState({
        companyCustomers: companyCustomers.filter(item => item !== customer)
      });
    }
  }

  search(e) {
    if (this.timer) clearTimeout(this.timer);
    const { search } = this.props;
    const value = e.target.value;

    this.timer = setTimeout(() => {
      search(value);
      this.setState({ searchValue: value });
    }, 1000);
  }

  loadMore() {
    this.props.search(this.state.searchValue, true);
  }

  renderFullName(customer) {
    if (customer.firstName || customer.lastName) {
      return (customer.firstName || '') + ' ' + (customer.lastName || '');
    }
    return customer.email || customer.phone || 'N/A';
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    const { addCustomer, company, customers } = this.props;

    const addCompanyTrigger = (
      <span>
        Don&apos;t see the Company you&apos;re looking for? &ensp;
        <a>Create a company</a>
      </span>
    );

    return (
      <FormWrapper>
        <InputsWrapper>
          <FormControl
            placeholder="Type to search"
            onChange={e => this.search(e)}
          />
          <TitleSpan>Customers</TitleSpan>
          <ul>
            {customers.map(customer => (
              <li key={customer._id}>
                <Icon
                  icon="plus"
                  onClick={() => this.handleChange(customer, 'addToCompany')}
                />
                {this.renderFullName(customer)}
              </li>
            ))}
            <LoadMore onClick={this.loadMore}>Load More</LoadMore>
          </ul>
        </InputsWrapper>
        <ListWrapper>
          <TitleSpan>{company.name}&apos;s Customers</TitleSpan>
          <ul>
            {this.state.companyCustomers.map(customer => (
              <li key={customer._id}>
                {this.renderFullName(customer)}
                <Icon
                  icon="close"
                  onClick={() =>
                    this.handleChange(customer, 'removeFromCompany')
                  }
                />
              </li>
            ))}
          </ul>
        </ListWrapper>
        <Modal.Footer>
          <Footer>
            <ModalTrigger title="New company" trigger={addCompanyTrigger}>
              <CustomerForm addCustomer={addCustomer} />
            </ModalTrigger>
            <Button btnStyle="simple" onClick={onClick.bind(this)}>
              <Icon icon="close" />CANCEL
            </Button>
            <Button btnStyle="success" onClick={this.save}>
              <Icon icon="checkmark" />SAVE
            </Button>
          </Footer>
        </Modal.Footer>
      </FormWrapper>
    );
  }
}

CustomeAssociate.propTypes = propTypes;
CustomeAssociate.contextTypes = contextTypes;

export default CustomeAssociate;
