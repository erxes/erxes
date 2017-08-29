import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import { ControlLabel } from 'react-bootstrap';
import { integrationOptions, selectOptions } from '../utils';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from '/imports/api/integrations/constants';

import { Wrapper } from '/imports/react-ui/layout/components';

const propTypes = {
  brands: PropTypes.array.isRequired,
  hideIntegration: PropTypes.bool,
  hideStartDate: PropTypes.bool,
};

class Filter extends React.Component {
  constructor(props) {
    super(props);

    // states
    this.state = {
      brandId: '',
      integrationType: '',
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

  onDateChange(type, e) {
    const target = $(e.currentTarget);
    Wrapper.Sidebar.filter(type, target.val());
  }

  dateFilter() {
    const { hideStartDate } = this.props;
    return (
      <div className="col-sm-4 pull-right">
        {hideStartDate
          ? null
          : <div className="col-sm-6">
              <ControlLabel>Start date</ControlLabel>
              <input
                id="startDate"
                type="date"
                className="form-control"
                onChange={this.onDateChange.bind(this, 'startDate')}
              />
            </div>}
        <div className="col-sm-6 pull-right">
          <ControlLabel>End date</ControlLabel>
          <input
            id="endDate"
            type="date"
            className="form-control"
            onChange={this.onDateChange.bind(this, 'endDate')}
          />
        </div>
      </div>
    );
  }

  renderIntegrations() {
    const integrations = INTEGRATIONS_TYPES.ALL_LIST;
    const { hideIntegration } = this.props;
    const hide = hideIntegration || false;

    if (hide) {
      return null;
    }

    return (
      <div className="pull-right col-sm-2">
        <ControlLabel>Integrations</ControlLabel>
        <Select
          placeholder="Choose integrations"
          value={this.state.integrationType}
          onChange={value => this.onTypeChange(value)}
          optionRenderer={option =>
            <div className="simple-option">
              <span>
                {option.label}
              </span>
            </div>}
          options={integrationOptions(integrations)}
        />
      </div>
    );
  }

  renderBrands() {
    const { brands } = this.props;
    return (
      <div className="pull-right col-sm-2">
        <ControlLabel>Brands</ControlLabel>

        <Select
          placeholder="Choose brands"
          value={this.state.brandId}
          onChange={value => this.onBrandChange(value)}
          optionRenderer={option =>
            <div className="simple-option">
              <span>
                {option.label}
              </span>
            </div>}
          options={selectOptions(brands)}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="insight-filter">
        <div className="row">
          {this.renderIntegrations()}
          {this.renderBrands()}
          {this.dateFilter()}
        </div>
      </div>
    );
  }
}

Filter.propTypes = propTypes;

export default Filter;
