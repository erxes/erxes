import React from 'react';
import { searchCustomer } from 'modules/common/utils';
import Select from 'react-select-plus';
import PropTypes from 'prop-types';
import { ModalTrigger } from 'modules/common/components';
import { CommonMerge } from '../';
import {
  CUSTOMER_BASIC_INFO,
  CUSTOMER_DATAS
} from 'modules/customers/constants';

const propTypes = {
  onSave: PropTypes.func.isRequired,
  customer: PropTypes.object.isRequired
};

class CustomerTargetMergeModal extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      customers: [],
      selectedCustomer: {}
    };

    this.onSelect = this.onSelect.bind(this);
  }

  generateOptions(customers) {
    return customers.map(customer => ({
      value: JSON.stringify(customer),
      label: customer.firstName || customer.email || customer.phone || 'N/A'
    }));
  }

  onSelect(option) {
    this.setState({ selectedCustomer: JSON.parse(option.value) });
  }

  renderMerger() {
    const { customer, onSave } = this.props;
    const { selectedCustomer } = this.state;

    return (
      <CommonMerge
        datas={[customer, selectedCustomer]}
        save={onSave}
        basicInfos={Object.assign({}, CUSTOMER_BASIC_INFO, CUSTOMER_DATAS)}
      />
    );
  }

  renderSelect() {
    const { customers } = this.state;

    return (
      <Select
        placeholder="Search..."
        onInputChange={value =>
          searchCustomer(value, customers => this.setState({ customers }))
        }
        onChange={this.onSelect}
        options={this.generateOptions(customers)}
      />
    );
  }

  render() {
    const { __ } = this.context;

    return (
      <ModalTrigger
        title={__('Merge')}
        trigger={<a>{__('Merge')}</a>}
        size="lg"
      >
        {this.renderSelect()}
        <br />
        {this.renderMerger()}
      </ModalTrigger>
    );
  }
}

CustomerTargetMergeModal.propTypes = propTypes;
CustomerTargetMergeModal.contextTypes = {
  __: PropTypes.func
};

export default CustomerTargetMergeModal;
