import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select-plus';
import Toggle from 'react-toggle';
import { ActionBar, Wrapper } from 'modules/layout/components';
import {
  Form,
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

    const { prevOptions, teamMembers } = props;

    const {
      notifyCustomer,
      availabilityMethod,
      supporterIds = [],
      isOnline,
      timezone,
      onlineHours,
      welcomeMessage,
      awayMessage,
      thankYouMessage
    } = prevOptions;

    const selectedMembers = teamMembers.filter(member =>
      supporterIds.includes(member._id)
    );

    this.state = {
      notifyCustomer: notifyCustomer || false,
      availabilityMethod: availabilityMethod || 'manual',
      isOnline: isOnline || false,
      timezone: timezone || '',
      onlineHours: (onlineHours || []).map(h => ({ _id: Math.random(), ...h })),
      welcomeMessage: welcomeMessage || '',
      awayMessage: awayMessage || '',
      thankYouMessage: thankYouMessage || '',
      supporterIds: supporterIds || [],
      supporters: this.generateSupporterOptions(selectedMembers)
    };

    this.save = this.save.bind(this);
    this.onOnlineHoursChange = this.onOnlineHoursChange.bind(this);
    this.onTeamMembersChange = this.onTeamMembersChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onToggleChange = this.onToggleChange.bind(this);
  }

  onSelectChange(e, name) {
    let value = '';

    if (e) {
      value = e.value;
    }

    this.setState({ [name]: value });
  }

  onToggleChange(e) {
    this.setState({ [e.target.name]: e.target.checked });
  }

  onOnlineHoursChange(onlineHours) {
    this.setState({ onlineHours });
  }

  onTeamMembersChange(options) {
    if (options.length < 3) {
      this.setState({
        supporters: options,
        supporterIds: options.map(option => option.value)
      });
    }
  }

  save(args) {
    const variables = { ...this.state };

    delete variables.supporters;

    const doc = {
      ...variables,
      ...args
    };

    this.props.save(doc);
  }

  generateSupporterOptions(members = []) {
    return members.map(member => ({
      value: member._id,
      label: member.details.fullName
    }));
  }

  renderOnlineHours() {
    if (this.state.availabilityMethod === 'manual') {
      return null;
    }

    return (
      <OnlineHours
        prevOptions={this.state.onlineHours}
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
            name="isOnline"
            defaultChecked={this.state.isOnline}
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

  renderContent() {
    const { __ } = this.context;

    return (
      <Form onSubmit={this.save}>
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
                  validations="isValue"
                  validationError="Please enter a welcome message"
                  name="welcomeMessage"
                  value={this.state.welcomeMessage}
                />
              </FormGroup>

              <SubHeading>{__('Offline messaging')}</SubHeading>

              <FormGroup>
                <ControlLabel>Away message</ControlLabel>

                <FormControl
                  componentClass="textarea"
                  placeholder={__('Write here Away message.')}
                  rows={3}
                  validations="isValue"
                  validationError="Please enter an away message"
                  name="awayMessage"
                  value={this.state.awayMessage}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Thank you message</ControlLabel>

                <FormControl
                  componentClass="textarea"
                  placeholder={__('Write here Thank you message.')}
                  rows={3}
                  validations="isValue"
                  validationError="Please enter a thank you message"
                  name="thankYouMessage"
                  value={this.state.thankYouMessage}
                />
              </FormGroup>
            </Col>
            <Col md={7}>
              <SubHeading>{__('Hours & Availability')}</SubHeading>
              <FormGroup>
                <FormControl
                  name="availabilityMethod"
                  value="manual"
                  componentClass="radio"
                  defaultChecked={this.state.availabilityMethod === 'manual'}
                  onChange={this.onInputChange}
                  inline
                >
                  {__('Turn online/offline manually')}
                </FormControl>

                <FormControl
                  name="availabilityMethod"
                  value="auto"
                  componentClass="radio"
                  defaultChecked={this.state.availabilityMethod === 'auto'}
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
                  value={this.state.timezone}
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
                  options={this.generateSupporterOptions(
                    this.props.teamMembers
                  )}
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
                    defaultChecked={this.state.notifyCustomer}
                    onChange={this.onToggleChange}
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
        {this.renderFooter()}
      </Form>
    );
  }

  renderFooter() {
    return (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/integrations">
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>

            <Button
              size="small"
              btnStyle="success"
              type="submit"
              icon="checked-1"
            >
              Save
            </Button>
          </Button.Group>
        }
      />
    );
  }

  render() {
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings/integrations' },
      { title: __('Integrations') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

Configs.propTypes = {
  prevOptions: PropTypes.object.isRequired, // eslint-disable-line
  teamMembers: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired
};

Configs.contextTypes = {
  __: PropTypes.func
};

export default Configs;
