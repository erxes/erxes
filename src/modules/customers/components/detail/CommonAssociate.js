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
import { CompanyForm } from 'modules/companies/components';
import { CustomerForm } from '../';
import {
  FormWrapper,
  InputsWrapper,
  ListWrapper,
  Footer,
  LoadMore
} from '../../styles';

const propTypes = {
  data: PropTypes.object.isRequired,
  save: PropTypes.func,
  search: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  datas: PropTypes.array.isRequired,
  add: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CommonAssociate extends React.Component {
  constructor(props) {
    super(props);
    const { type } = this.props;

    const datas = this.props.data[type] || [];

    this.state = {
      datas,
      loadmore: true,
      searchValue: ''
    };

    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.search = this.search.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  save() {
    const { datas } = this.state;
    const { type } = this.props;

    const doc = {};

    if (type !== 'customers') {
      const companyIds = [];

      datas.forEach(data => {
        companyIds.push(data._id.toString());
      });
      doc.companyIds = companyIds;
    } else {
      const customerIds = [];

      datas.forEach(data => {
        customerIds.push(data._id.toString());
      });
      doc.customerIds = customerIds;
    }

    this.props.save(doc);
    this.context.closeModal();
  }

  componentWillUnmount() {
    this.props.search('');
  }

  componentWillReceiveProps(newProps) {
    if (newProps.datas.length < 20) {
      this.setState({ loadmore: false });
    } else {
      this.setState({ loadmore: true });
    }
  }

  handleChange(e, data) {
    const { datas } = this.state;
    const type = e.target.getAttribute('icon');

    switch (type) {
      case 'plus':
        if (datas.some(item => item._id === data._id))
          return Alert.warning('Already added');
        this.setState({
          datas: [...datas, data]
        });
        break;
      default:
        this.setState({
          datas: datas.filter(item => item !== data)
        });
        break;
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
    this.setState({ loadmore: false });
    this.props.search(this.state.searchValue, true);
  }

  renderFullName(customer) {
    if (customer.firstName || customer.lastName) {
      return (customer.firstName || '') + ' ' + (customer.lastName || '');
    }
    return customer.email || customer.phone || 'N/A';
  }

  renderRow(data, icon) {
    const { type } = this.props;

    return (
      <li key={data._id}>
        <Icon icon={icon} onClick={e => this.handleChange(e, data)} />
        {type === 'customers' ? this.renderFullName(data) : data.name}
      </li>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    const { type, datas, add } = this.props;

    const addTrigger = (
      <span>
        Don&apos;t see the result you&apos;re looking for? &ensp;
        <a>Create a new</a>
      </span>
    );

    return (
      <FormWrapper>
        <InputsWrapper>
          <FormControl
            placeholder="Type to search"
            onChange={e => this.search(e)}
          />
          <ul>
            {datas.map(data => this.renderRow(data, 'plus'))}
            {this.state.loadmore ? (
              <LoadMore onClick={this.loadMore}>Load More</LoadMore>
            ) : null}
          </ul>
        </InputsWrapper>
        <ListWrapper>
          <ul>{this.state.datas.map(data => this.renderRow(data, 'close'))}</ul>
        </ListWrapper>
        <Modal.Footer>
          <Footer>
            <ModalTrigger title="New company" trigger={addTrigger}>
              {type === 'customers' ? (
                <CustomerForm addCustomer={add} />
              ) : (
                <CompanyForm addCompany={add} />
              )}
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

CommonAssociate.propTypes = propTypes;
CommonAssociate.contextTypes = contextTypes;

export default CommonAssociate;
