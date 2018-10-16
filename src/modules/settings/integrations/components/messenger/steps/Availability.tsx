import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { timezones } from 'modules/settings/integrations/constants';
import * as React from 'react';
import Select from 'react-select-plus';
import Toggle from 'react-toggle';
import { OnlineHours } from '.';
import { IOnlineHour } from '../../../types';

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
  constructor(props: Props) {
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
        prevOptions={this.props.onlineHours || []}
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
    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <FormControl
              value="manual"
              componentClass="radio"
              checked={this.props.availabilityMethod === 'manual'}
              onChange={(e: React.FormEvent<HTMLElement>) => {
                const target = e.currentTarget as HTMLInputElement;
                return this.onChangeFunction(
                  'availabilityMethod',
                  target.value
                );
              }}
              inline={true}
            >
              {__('Turn online/offline manually')}
            </FormControl>

            <FormControl
              value="auto"
              componentClass="radio"
              checked={this.props.availabilityMethod === 'auto'}
              onChange={(e: React.FormEvent<HTMLElement>) => {
                const target = e.currentTarget as HTMLInputElement;
                this.onChangeFunction('availabilityMethod', target.value);
              }}
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
              onChange={e => this.onSelectChange(e, 'timezone')}
              clearable={false}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Availability;
