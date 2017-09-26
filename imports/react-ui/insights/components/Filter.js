import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { ControlLabel } from 'react-bootstrap';
import { integrationOptions, selectOptions } from '../utils';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from '/imports/api/integrations/constants';
import { FlowRouter } from 'meteor/kadira:flow-router';

const propTypes = {
  brands: PropTypes.array.isRequired,
};

class Filter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      brandId: FlowRouter.getQueryParam('brandId') || '',
      integrationType: FlowRouter.getQueryParam('integrationType') || '',
    };
  }

  onTypeChange(value) {
    const integrationType = value ? value.value : '';
    this.setState({ integrationType });
    FlowRouter.setQueryParams({ ['integrationType']: integrationType });
  }

  onBrandChange(value) {
    const brandId = value ? value.value : '';
    this.setState({ brandId });
    FlowRouter.setQueryParams({ ['brandId']: brandId });
  }

  onDateChange(type, e) {
    const target = $(e.currentTarget);
    FlowRouter.setQueryParams({ [type]: target.val() });
  }

  dateFilter() {
    return (
      <div className="flex-item">
        <ControlLabel>End date</ControlLabel>
        <input
          id="endDate"
          type="date"
          className="form-control"
          onChange={this.onDateChange.bind(this, 'endDate')}
        />
      </div>
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
              <span>
                {option.label}
              </span>
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
              <span>
                {option.label}
              </span>
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
            <input
              id="startDate"
              type="date"
              className="form-control"
              onChange={this.onDateChange.bind(this, 'startDate')}
            />
          </div>
          {this.dateFilter()}
        </div>
      </div>
    );
  }
}

Filter.propTypes = propTypes;

export default Filter;
