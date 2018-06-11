import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import Select from 'react-select-plus';
import {
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { CommonPreview } from './preview';
import OnlineHours from '../OnlineHours';
import { timezones } from '../../constants';
import {
  LeftItem,
  Preview,
  FlexItem
} from 'modules/common/components/step/styles';
import { SubHeading } from 'modules/settings/styles';

const propTypes = {
  onChange: PropTypes.func,
  prevOptions: PropTypes.object, // eslint-disable-line
  teamMembers: PropTypes.array.isRequired,
  isOnline: PropTypes.bool,
  availabilityMethod: PropTypes.string,
  timezone: PropTypes.string,
  notifyCustomer: PropTypes.bool,
  onlineHours: PropTypes.array,
  supporterIds: PropTypes.array
};

class Availability extends Component {
  constructor(props) {
    super(props);

    const { teamMembers, supporterIds } = props;

    const selectedMembers = teamMembers.filter(member =>
      supporterIds.includes(member._id)
    );

    this.state = {
      supporters: this.generateSupporterOptions(selectedMembers)
    };

    this.onTeamMembersChange = this.onTeamMembersChange.bind(this);
    this.onOnlineHoursChange = this.onOnlineHoursChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onToggleChange = this.onToggleChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onSelectChange(e, name) {
    let value = '';

    if (e) {
      value = e.value;
    }

    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  onInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    this.props.onChange(e.target.name, e.target.value);
  }

  onOnlineHoursChange(onlineHours) {
    this.setState({ onlineHours });
    this.props.onChange('onlineHours', onlineHours);
  }

  onTeamMembersChange(options) {
    if (options.length < 3) {
      this.setState({
        supporters: options,
        supporterIds: options.map(option => option.value)
      });
      this.props.onChange('supporterIds', options.map(option => option.value));
    }
  }

  onToggleChange(e) {
    this.setState({ [e.target.name]: e.target.checked });
    this.props.onChange(e.target.name, e.target.checked);
  }

  generateSupporterOptions(members = []) {
    return members.map(member => ({
      value: member._id,
      label: member.details.fullName
    }));
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
            name="isOnline"
            checked={this.props.isOnline}
            onChange={this.onToggleChange}
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
              name="availabilityMethod"
              value="manual"
              componentClass="radio"
              checked={this.props.availabilityMethod === 'manual'}
              onChange={this.onInputChange}
              inline
            >
              {__('Turn online/offline manually')}
            </FormControl>

            <FormControl
              name="availabilityMethod"
              value="auto"
              componentClass="radio"
              checked={this.props.availabilityMethod === 'auto'}
              onChange={this.onInputChange}
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

          <FormGroup>
            <ControlLabel>Supporters</ControlLabel>

            <Select
              closeOnSelect={false}
              value={this.state.supporters}
              options={this.generateSupporterOptions(this.props.teamMembers)}
              onChange={this.onTeamMembersChange}
              clearable={true}
              multi
            />
          </FormGroup>

          <SubHeading>{__('Other configs')}</SubHeading>

          <FormGroup>
            <ControlLabel>Notify customer</ControlLabel>
            <div>
              <Toggle
                className="wide"
                name="notifyCustomer"
                checked={this.props.notifyCustomer}
                onChange={this.onToggleChange}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
              />
            </div>
          </FormGroup>
        </LeftItem>
        <Preview>
          <CommonPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

Availability.propTypes = propTypes;
Availability.contextTypes = {
  __: PropTypes.func
};

export default Availability;
