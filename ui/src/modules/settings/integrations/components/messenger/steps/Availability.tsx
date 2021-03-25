import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import Toggle from 'modules/common/components/Toggle';
import timezones from 'modules/common/constants/timezones';
import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import { IOnlineHour } from '../../../types';
import OnlineHours from './OnlineHours';
import { ToggleWrapper } from '../widgetPreview/styles';

type Props = {
  onChange: (
    name: 'onlineHours' | 'isOnline' | 'availabilityMethod' | 'timezone',
    value: string
  ) => void;
  isOnline: boolean;
  availabilityMethod?: string;
  timezone?: string;
  onlineHours?: IOnlineHour[];
};

class Availability extends React.Component<Props> {
  onSelectChange = (e, name) => {
    let value = '';

    if (e) {
      value = e.value;
    }

    this.setState({ [name]: value });
    this.props.onChange(name, value);
  };

  onChangeFunction = (name, value) => {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  };

  onOnlineHoursChange = onlineHours => {
    this.setState({ onlineHours });
    this.props.onChange('onlineHours', onlineHours);
  };

  renderOnlineHours() {
    if (this.props.availabilityMethod === 'manual') {
      return null;
    }

    return (
      <OnlineHours
        prevOptions={this.props.onlineHours || []}
        onChange={this.onOnlineHoursChange}
      />
    );
  }

  renderIsOnline() {
    if (this.props.availabilityMethod === 'auto') {
      return null;
    }

    const onChange = e => this.onChangeFunction('isOnline', e.target.checked);

    return (
      <FormGroup>
        <ControlLabel>Visible online to visitor or customer</ControlLabel>
        <ToggleWrapper>
          <Toggle
            checked={this.props.isOnline}
            onChange={onChange}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </ToggleWrapper>
      </FormGroup>
    );
  }

  render() {
    const onChange = e =>
      this.onChangeFunction(
        'availabilityMethod',
        (e.currentTarget as HTMLInputElement).value
      );

    const timezoneOnChange = e => this.onSelectChange(e, 'timezone');

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <FormControl
              value="manual"
              componentClass="radio"
              checked={this.props.availabilityMethod === 'manual'}
              onChange={onChange}
              inline={true}
            >
              {__('Turn online/offline manually')}
            </FormControl>

            <FormControl
              value="auto"
              componentClass="radio"
              checked={this.props.availabilityMethod === 'auto'}
              onChange={onChange}
              inline={true}
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
              onChange={timezoneOnChange}
              clearable={false}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Availability;
