import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { ControlLabel } from 'modules/common/components';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { integrationOptions, selectOptions } from '../utils';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import { Wrapper } from 'modules/layout/components';

const propTypes = {
  brands: PropTypes.array.isRequired,
  queryParams: PropTypes.object
};

class Filter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...props.queryParams,
      // check condition for showing placeholder
      startDate: props.queryParams.startDate
        ? moment(props.queryParams.startDate)
        : '',
      endDate: props.queryParams.endDate
        ? moment(props.queryParams.endDate)
        : ''
    };
  }

  onTypeChange(value) {
    const integrationType = value ? value.value : '';
    this.setState({ integrationType });
    Wrapper.Sidebar.filter('integrationType', integrationType);
  }

  onBrandChange(value) {
    const brandId = value ? value.value : '';
    this.setState({ brandId });
    Wrapper.Sidebar.filter('brandId', brandId);
  }

  onDateInputChange(type, date) {
    this.setState({ [type]: date });
    Wrapper.Sidebar.filter(
      type,
      date ? moment(date).format('YYYY-MM-DD') : null
    );
  }

  renderIntegrations() {
    const integrations = INTEGRATIONS_TYPES.ALL_LIST;

    return (
      <div className="flex-item">
        <ControlLabel>Integrations</ControlLabel>
        <Select
          placeholder="Choose integrations"
          value={this.state.integrationType}
          onChange={value => this.onTypeChange(value)}
          optionRenderer={option => (
            <div className="simple-option">
              <span>{option.label}</span>
            </div>
          )}
          options={integrationOptions(integrations)}
        />
      </div>
    );
  }

  renderBrands() {
    const { brands } = this.props;
    return (
      <div className="flex-item">
        <ControlLabel>Brands</ControlLabel>

        <Select
          placeholder="Choose brands"
          value={this.state.brandId}
          onChange={value => this.onBrandChange(value)}
          optionRenderer={option => (
            <div className="simple-option">
              <span>{option.label}</span>
            </div>
          )}
          options={selectOptions(brands)}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="insight-filter">
        <h5 className="insight-title">Filter</h5>
        <div className="flex-row">
          {this.renderIntegrations()}
          {this.renderBrands()}
          <div className="flex-item">
            <ControlLabel>Start date</ControlLabel>
            <DatePicker
              selected={this.state.startDate}
              className="form-control"
              placeholderText="Click to select a date"
              onChange={this.onDateInputChange.bind(this, 'startDate')}
            />
          </div>
          <div className="flex-item">
            <ControlLabel>End date</ControlLabel>
            <DatePicker
              selected={this.state.endDate}
              className="form-control"
              placeholderText="Click to select a date"
              onChange={this.onDateInputChange.bind(this, 'endDate')}
            />
          </div>
        </div>
      </div>
    );
  }
}

Filter.propTypes = propTypes;

export default Filter;
