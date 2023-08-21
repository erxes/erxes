import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Description } from '@erxes/ui-inbox/src/settings/integrations/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IOnlineHour } from '@erxes/ui-inbox/src/settings/integrations/types';
import OnlineHours from './OnlineHours';
import { RESPOND_RATES } from '../../../constants';
import React from 'react';
import Select from 'react-select-plus';
import Toggle from '@erxes/ui/src/components/Toggle';
import { ToggleWrapper } from '../widgetPreview/styles';
import { __ } from 'coreui/utils';
import timezones from '@erxes/ui/src/constants/timezones';

type Props = {
  onChange: (
    name:
      | 'onlineHours'
      | 'isOnline'
      | 'availabilityMethod'
      | 'responseRate'
      | 'showTimezone'
      | 'timezone'
      | 'hideWhenOffline',
    value: string
  ) => void;
  isOnline: boolean;
  hideWhenOffline?: boolean;
  availabilityMethod?: string;
  timezone?: string;
  responseRate?: string;
  showTimezone?: boolean;
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

  renderShowTimezone() {
    const { timezone = '' } = this.props;

    const onChange = e =>
      this.onChangeFunction('showTimezone', e.target.checked);

    const timezoneOnChange = e => this.onSelectChange(e, 'timezone');

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>{__('Default Timezone')}</ControlLabel>
          <Description>
            {__(
              "This timezone will be calculated if supporters haven't chosen one."
            )}
          </Description>
          <Select
            value={timezone}
            options={timezones}
            onChange={timezoneOnChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>
            {__('Display Operator Timezone')}
          </ControlLabel>
          <Description>
            {' '}
            {__(
              'Display chat operator timezone set in their location in team member profiles'
            )}
          </Description>
          <ToggleWrapper>
            <Toggle
              checked={this.props.showTimezone}
              onChange={onChange}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </ToggleWrapper>
        </FormGroup>
      </React.Fragment>
    );
  }

  renderOfflineOption() {
    const { availabilityMethod, hideWhenOffline } = this.props;

    if (availabilityMethod === 'manual') {
      return null;
    }

    const onChange = e =>
      this.onChangeFunction('hideWhenOffline', e.target.checked);

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>
            {__('Hide messenger during offline hours')}
          </ControlLabel>
          <Description>
            {__(
              "Forcibly hide the messenger when you're offline. This will hide the messenger from your website visitors."
            )}
          </Description>

          <ToggleWrapper>
            <Toggle
              checked={hideWhenOffline}
              onChange={onChange}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </ToggleWrapper>
        </FormGroup>
      </React.Fragment>
    );
  }

  render() {
    const onChange = e =>
      this.onChangeFunction(
        'availabilityMethod',
        (e.currentTarget as HTMLInputElement).value
      );

    const respondTypeOnChange = e => this.onSelectChange(e, 'responseRate');

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
            <ControlLabel required={true}>Response rate</ControlLabel>
            <FormControl
              value="auto"
              componentClass="radio"
              checked={false}
              inline={true}
              disabled={true}
            >
              {__(
                'Automatically calculated depending on your First Response Rate in Reports'
              )}
            </FormControl>
            <FormControl
              value="manual"
              componentClass="radio"
              checked={true}
              inline={true}
            >
              {__('Set to display your pre defined response rate')}
            </FormControl>
            <Select
              required={true}
              value={this.props.responseRate}
              options={RESPOND_RATES}
              onChange={respondTypeOnChange}
              clearable={false}
            />
          </FormGroup>

          {this.renderShowTimezone()}
          {this.renderOfflineOption()}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Availability;
