import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select-plus';
import Toggle from 'react-toggle';
import { ActionBar, Wrapper } from 'modules/layout/components';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import Sidebar from '../Sidebar';
import { timezones } from '../constants';
import OnlineHours from './OnlineHours';
import { ContentBox, SubHeading } from '../../styles';

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
      <FormGroup>
        <ControlLabel>Visible online to visitor or customer</ControlLabel>
        <div>
          <Toggle
            className="wide"
            checked={this.state.isOnline}
            onChange={this.onIsOnlineChange}
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
    const content = (
      <ContentBox>
        <Row>
          <Col md={5}>
            <SubHeading>{__('Online messaging')}</SubHeading>

            <FormGroup>
              <ControlLabel>Welcome message</ControlLabel>

              <FormControl
                componentClass="textarea"
                placeholder={__('Write here Welcome message.')}
                rows={3}
                value={this.state.welcomeMessage}
                onChange={this.onWelcomeMessageChange}
              />
            </FormGroup>

            <SubHeading>{__('Offline messaging')}</SubHeading>

            <FormGroup>
              <ControlLabel>Away message</ControlLabel>

              <FormControl
                componentClass="textarea"
                placeholder={__('Write here Away message.')}
                rows={3}
                value={this.state.awayMessage}
                onChange={this.onAwayMessageChange}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Thank you message</ControlLabel>

              <FormControl
                componentClass="textarea"
                placeholder={__('Write here Thank you message.')}
                rows={3}
                value={this.state.thankYouMessage}
                onChange={this.onThankYouMessageChange}
              />
            </FormGroup>
          </Col>
          <Col md={7}>
            <SubHeading>{__('Hours & Availability')}</SubHeading>
            <FormGroup>
              <FormControl
                name="method"
                value="manual"
                componentClass="radio"
                checked={this.state.availabilityMethod === 'manual'}
                onChange={this.onMethodChange}
                inline
              >
                {__('Turn online/offline manually')}
              </FormControl>

              <FormControl
                name="method"
                value="auto"
                componentClass="radio"
                checked={this.state.availabilityMethod === 'auto'}
                onChange={this.onMethodChange}
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
                value={this.state.timezone}
                options={timezones}
                onChange={this.onTimezoneChange}
                clearable={false}
              />
            </FormGroup>

            <SubHeading>{__('Other configs')}</SubHeading>

            <FormGroup>
              <ControlLabel>Notify customer</ControlLabel>
              <div>
                <Toggle
                  className="wide"
                  checked={this.state.notifyCustomer}
                  onChange={this.onNotifyCustomerChange}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>
                  }}
                />
              </div>
            </FormGroup>
          </Col>
        </Row>
      </ContentBox>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings/integrations' },
      { title: __('Integrations') }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/integrations">
              <Button size="small" btnStyle="simple" icon="close">
                Cancel
              </Button>
            </Link>

            <Button
              size="small"
              btnStyle="success"
              onClick={this.save}
              icon="checkmark"
            >
              Save
            </Button>
          </Button.Group>
        }
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        footer={actionFooter}
        content={content}
      />
    );
  }
}

Configs.propTypes = {
  prevOptions: PropTypes.object.isRequired, // eslint-disable-line
  save: PropTypes.func.isRequired
};

Configs.contextTypes = {
  __: PropTypes.func
};

export default Configs;
