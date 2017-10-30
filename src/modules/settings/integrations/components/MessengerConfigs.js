import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Radio, Col, Row, ButtonGroup } from 'react-bootstrap';
import Select from 'react-select-plus';
import Toggle from 'react-toggle';
import { Wrapper } from 'modules/layout/components';
import Sidebar from '../../Sidebar';
import { timezones } from '../constants';
import OnlineHours from './OnlineHours';
import {
  Button,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';

class Configs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notifyCustomer: props.prevOptions.notifyCustomer || false,
      availabilityMethod: props.prevOptions.availabilityMethod || 'manual',
      isOnline: props.prevOptions.isOnline || false,
      timezone: props.prevOptions.timezone || '',
      onlineHours: props.prevOptions.onlineHours || [],
      welcomeMessage: props.prevOptions.welcomeMessage || '',
      awayMessage: props.prevOptions.awayMessage || '',
      thankYouMessage: props.prevOptions.thankYouMessage || ''
    };

    this.save = this.save.bind(this);
    this.onMethodChange = this.onMethodChange.bind(this);
    this.onNotifyCustomerChange = this.onNotifyCustomerChange.bind(this);
    this.onIsOnlineChange = this.onIsOnlineChange.bind(this);
    this.onTimezoneChange = this.onTimezoneChange.bind(this);
    this.onOnlineHoursChange = this.onOnlineHoursChange.bind(this);
    this.onWelcomeMessageChange = this.onWelcomeMessageChange.bind(this);
    this.onAwayMessageChange = this.onAwayMessageChange.bind(this);
    this.onThankYouMessageChange = this.onThankYouMessageChange.bind(this);
  }

  onMethodChange(e) {
    this.setState({ availabilityMethod: e.target.value });
  }

  onNotifyCustomerChange(e) {
    this.setState({ notifyCustomer: e.target.checked });
  }

  onIsOnlineChange(e) {
    this.setState({ isOnline: e.target.checked });
  }

  onTimezoneChange(e) {
    this.setState({ timezone: e.value });
  }

  onOnlineHoursChange(onlineHours) {
    this.setState({ onlineHours });
  }

  onWelcomeMessageChange(e) {
    this.setState({ welcomeMessage: e.target.value });
  }

  onAwayMessageChange(e) {
    this.setState({ awayMessage: e.target.value });
  }

  onThankYouMessageChange(e) {
    this.setState({ thankYouMessage: e.target.value });
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
      <div className="flex-inline">
        <Toggle
          className="wide"
          checked={this.state.isOnline}
          onChange={this.onIsOnlineChange}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
        <span>Is online</span>
      </div>
    );
  }

  render() {
    const content = (
      <div className="margined type-box">
        <Row>
          <Col md={5}>
            <h2>Online messaging</h2>

            <FormGroup>
              <ControlLabel>Welcome message</ControlLabel>

              <FormControl
                componentClass="textarea"
                rows={3}
                value={this.state.welcomeMessage}
                onChange={this.onWelcomeMessageChange}
              />
            </FormGroup>

            <h2>Offline messaging</h2>

            <FormGroup>
              <ControlLabel>Away message</ControlLabel>

              <FormControl
                componentClass="textarea"
                rows={3}
                value={this.state.awayMessage}
                onChange={this.onAwayMessageChange}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Thank you message</ControlLabel>

              <FormControl
                componentClass="textarea"
                rows={3}
                value={this.state.thankYouMessage}
                onChange={this.onThankYouMessageChange}
              />
            </FormGroup>
          </Col>
          <Col md={7}>
            <h2>Hours & Availability</h2>
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

              <Select
                value={this.state.timezone}
                options={timezones}
                onChange={this.onTimezoneChange}
                clearable={false}
              />
            </FormGroup>
          </Col>

          <Col md={7}>
            <h2>Other configs</h2>

            <div className="flex-inline">
              <Toggle
                className="wide"
                checked={this.state.notifyCustomer}
                onChange={this.onNotifyCustomerChange}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
              />
              <span>Notify customer</span>
            </div>
          </Col>
        </Row>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' }
    ];

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button btnStyle="success" onClick={this.save}>
              <Icon icon="checkmark" /> Save
            </Button>

            <Button btnStyle="simple" href="/settings/integrations">
              <Icon icon="close" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
        content={content}
      />
    );
  }
}

Configs.propTypes = {
  prevOptions: PropTypes.object.isRequired, // eslint-disable-line
  save: PropTypes.func.isRequired
};

export default Configs;
