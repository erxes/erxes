import React, { PropTypes, Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Radio,
  Checkbox,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';
import { timezones } from '../constants';
import OnlineHours from './OnlineHours.jsx';

class Availability extends Component {
  constructor(props) {
    super(props);

    this.state = {
      availabilityMethod: props.prevOptions.availabilityMethod || 'manual',
      isOnline: props.prevOptions.isOnline || false,
      timezone: props.prevOptions.timezone || '',
      onlineHours: props.prevOptions.onlineHours || [],
    };

    this.save = this.save.bind(this);
    this.onMethodChange = this.onMethodChange.bind(this);
    this.onIsOnlineChange = this.onIsOnlineChange.bind(this);
    this.onTimezoneChange = this.onTimezoneChange.bind(this);
    this.onOnlineHoursChange = this.onOnlineHoursChange.bind(this);
  }

  onMethodChange(e) {
    this.setState({ availabilityMethod: e.target.value });
  }

  onIsOnlineChange(e) {
    this.setState({ isOnline: e.target.checked });
  }

  onTimezoneChange(e) {
    this.setState({ timezone: e.target.value });
  }

  onOnlineHoursChange(onlineHours) {
    this.setState({ onlineHours });
  }

  save(e) {
    e.preventDefault();

    this.props.save(this.state);
  }

  renderOnlineHours() {
    if (this.state.availabilityMethod === 'manual') {
      return null;
    }

    return (
      <OnlineHours
        prevOptions={this.props.prevOptions.onlineHours}
        onChange={this.onOnlineHoursChange}
      />
    );
  }

  renderIsOnline() {
    if (this.state.availabilityMethod === 'auto') {
      return null;
    }

    return (
      <FormGroup>
        <Checkbox
          checked={this.state.isOnline}
          onChange={this.onIsOnlineChange}
          inline
        >
          Is online
        </Checkbox>
      </FormGroup>
    );
  }

  render() {
    const content = (
      <div className="margined">
        <FormGroup>
          <Radio
            name="method"
            value="manual"
            checked={this.state.availabilityMethod === 'manual'}
            onChange={this.onMethodChange}
            inline
          >

            Turn online/offline manually
          </Radio>

          <Radio
            name="method"
            value="auto"
            checked={this.state.availabilityMethod === 'auto'}
            onChange={this.onMethodChange}
            inline
          >
            Set to follow your schedule
          </Radio>
        </FormGroup>

        {this.renderIsOnline()}
        {this.renderOnlineHours()}

        <FormGroup>
          <ControlLabel>Time zone</ControlLabel>

          <FormControl
            componentClass="select"
            name="timezone"
            value={this.state.timezone}
            onChange={this.onTimezoneChange}
          >

            {timezones.map((timezone, index) =>
              <option key={index} value={timezone.value}>{timezone.text}</option>,
            )}
          </FormControl>
        </FormGroup>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' },
    ];

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button bsStyle="link" onClick={this.save}>
              <i className="ion-checkmark-circled" /> Save
            </Button>

            <Button bsStyle="link" href={FlowRouter.path('/settings/integrations')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

Availability.propTypes = {
  prevOptions: PropTypes.object.isRequired, // eslint-disable-line
  save: PropTypes.func.isRequired,
};

export default Availability;
