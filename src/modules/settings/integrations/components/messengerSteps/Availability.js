import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import Select from 'react-select-plus';
import {
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { OnlineHours } from '/';
import { timezones } from '../../constants';
import { LeftItem, FlexItem } from 'modules/common/components/step/styles';

const propTypes = {
  onChange: PropTypes.func,
  isOnline: PropTypes.bool,
  availabilityMethod: PropTypes.string,
  timezone: PropTypes.string,
  onlineHours: PropTypes.array
};

class Availability extends Component {
  constructor(props) {
    super(props);

    this.onOnlineHoursChange = this.onOnlineHoursChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onChangeFunction = this.onChangeFunction.bind(this);
  }

  onSelectChange(e, name) {
    let value = '';

    if (e) {
      value = e.value;
    }

    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  onChangeFunction(name, value) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  onOnlineHoursChange(onlineHours) {
    this.setState({ onlineHours });
    this.props.onChange('onlineHours', onlineHours);
  }

  renderOnlineHours() {
    if (this.props.availabilityMethod === 'manual') {
      return null;
    }

    return (
      <OnlineHours
        prevOptions={this.props.onlineHours}
        onChange={this.onOnlineHoursChange}
      />
    );
  }

  renderIsOnline() {
    if (this.props.availabilityMethod === 'auto') {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Visible online to visitor or customer</ControlLabel>
        <div>
          <Toggle
            className="wide"
            checked={this.props.isOnline}
            onChange={e => this.onChangeFunction('isOnline', e.target.checked)}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  render() {
    const { __ } = this.context;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <FormControl
              value="manual"
              componentClass="radio"
              checked={this.props.availabilityMethod === 'manual'}
              onChange={e =>
                this.onChangeFunction('availabilityMethod', e.target.value)
              }
              inline
            >
              {__('Turn online/offline manually')}
            </FormControl>

            <FormControl
              value="auto"
              componentClass="radio"
              checked={this.props.availabilityMethod === 'auto'}
              onChange={e =>
                this.onChangeFunction('availabilityMethod', e.target.value)
              }
              inline
            >
              {__('Set to follow your schedule')}
            </FormControl>
          </FormGroup>

          {this.renderIsOnline()}
          {this.renderOnlineHours()}

          <FormGroup>
            <ControlLabel>Time zone</ControlLabel>

            <Select
              value={this.props.timezone}
              options={timezones}
              onChange={e => this.onSelectChange(e, 'timezone')}
              clearable={false}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

Availability.propTypes = propTypes;
Availability.contextTypes = {
  __: PropTypes.func
};

export default Availability;
