import React from 'react';
import { searchCompany } from 'modules/common/utils';
import Select from 'react-select-plus';
import PropTypes from 'prop-types';
import { ModalTrigger } from 'modules/common/components';
import { CommonMerge } from 'modules/customers/components';
import { COMPANY_INFO } from 'modules/companies/constants';

const propTypes = {
  onSave: PropTypes.func.isRequired,
  company: PropTypes.object.isRequired
};

class CompanyTargetMergeModal extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      companies: [],
      selectedCompany: {}
    };

    this.onSelect = this.onSelect.bind(this);
  }

  generateOptions(companies) {
    return companies.map(company => ({
      value: JSON.stringify(company),
      label: company.name || company.website || 'N/A'
    }));
  }

  onSelect(option) {
    this.setState({ selectedCompany: JSON.parse(option.value) });
  }

  renderMerger() {
    const { company, onSave } = this.props;
    const { selectedCompany } = this.state;

    return (
      <CommonMerge
        datas={[company, selectedCompany]}
        save={onSave}
        basicInfos={COMPANY_INFO}
      />
    );
  }

  renderSelect() {
    const { companies } = this.state;

    return (
      <Select
        placeholder="Search..."
        onInputChange={value =>
          searchCompany(value, companies => this.setState({ companies }))
        }
        onChange={this.onSelect}
        options={this.generateOptions(companies)}
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

CompanyTargetMergeModal.propTypes = propTypes;
CompanyTargetMergeModal.contextTypes = {
  __: PropTypes.func
};

export default CompanyTargetMergeModal;
