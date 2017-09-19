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
    const { hideIntegration } = this.props;
    const hide = hideIntegration || false;

    if (hide) {
      return null;
    }

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
    const { hideStartDate } = this.props;
    return (
      <div className="insight-filter">
        <h5 className="insight-title">Filter</h5>
        <div className="flex-row">
          {this.renderIntegrations()}
          {this.renderBrands()}
          {hideStartDate
            ? null
            : <div className="flex-item">
                <ControlLabel>Start date</ControlLabel>
                <input
                  id="startDate"
                  type="date"
                  className="form-control"
                  onChange={this.onDateChange.bind(this, 'startDate')}
                />
              </div>}

          {this.dateFilter()}
        </div>
      </div>
    );
  }
}

Filter.propTypes = propTypes;

export default Filter;
