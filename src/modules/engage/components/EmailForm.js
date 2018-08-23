import React, { Component } from 'react';
import styled from 'styled-components';
import ReactDom from 'react-dom';
import Datetime from 'react-datetime';
import PropTypes from 'prop-types';
import {
  FormControl,
  ControlLabel,
  FormGroup,
  Uploader
} from 'modules/common/components';
import { EMAIL_CONTENT_CLASS, SCHEDULE_TYPES } from 'modules/engage/constants';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import Editor from './Editor';

const PreviewContainer = styled.div`
  margin: 20px;
  height: 100%;
  p {
    padding: 20px;
  }
`;

const EmailContent = styled.div`
  padding: 20px 30px;

  p {
    padding: 0px;
    margin: 0px;
  }
`;

const propTypes = {
  changeEmail: PropTypes.func,
  message: PropTypes.string,
  users: PropTypes.array,
  templates: PropTypes.array,
  defaultValue: PropTypes.object,
  kind: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

class EmailForm extends Component {
  constructor(props) {
    super(props);

    const message = this.props.defaultValue || {};

    this.state = {
      fromUser: message.fromUser || '',
      currentTemplate: '',
      message: message.message,
      email: {
        subject: message.email.subject || '',
        templateId: message.email.templateId || '',
        attachments: message.email.attachments || []
      },
      scheduleDate: {
        type: message.scheduleDate.type || '',
        month: message.scheduleDate.month || '',
        day: message.scheduleDate.day || '',
        time: message.scheduleDate.time
      }
    };
  }

  componentDidMount() {
    this.templateChange(this.props.defaultValue.email.templateId);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.defaultValue.message !== prevProps.defaultValue.message ||
      this.state.currentTemplate !== prevState.currentTemplate
    ) {
      this.renderBuilder();
    }
  }

  changeSchedule(key, value) {
    let scheduleDate = {
      ...this.state.scheduleDate
    };

    scheduleDate[key] = value;
    this.setState({ scheduleDate });
    this.props.changeEmail('scheduleDate', scheduleDate);
  }

  changeContent(key, value) {
    let email = { ...this.state.email };

    email[key] = value;

    this.setState({ email });
    this.props.changeEmail('email', email);
  }

  changeUser(fromUser) {
    this.setState({ fromUser });
    this.props.changeEmail('fromUser', fromUser);
  }

  templateChange(value) {
    this.changeContent('templateId', value);
    this.setState({ currentTemplate: this.findTemplate(value) });
    this.renderBuilder();
  }

  generateOptions(number) {
    let options = [];

    for (let i = 1; i <= number; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }

    return options;
  }

  findTemplate(id) {
    const template = this.props.templates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return null;
  }

  renderBuilder() {
    const contentContainer = document.getElementsByClassName(
      EMAIL_CONTENT_CLASS
    );

    // render editor to content
    if (contentContainer.length > 0) {
      ReactDom.render(
        <EmailContent
          dangerouslySetInnerHTML={{
            __html: this.props.defaultValue.message
          }}
        />,
        contentContainer[0]
      );
    }
  }

  renderMessage() {
    if (!this.state.currentTemplate) {
      return null;
    }

    return (
      <PreviewContainer
        dangerouslySetInnerHTML={{
          __html: this.state.currentTemplate
        }}
      />
    );
  }

  renderScheduler() {
    if (this.props.kind !== 'auto') {
      return null;
    }

    const { __ } = this.context;
    const { type, day, month, time } = this.state.scheduleDate;

    const props = {
      inputProps: { placeholder: __('Click to select a date') },
      timeFormat: 'HH:mm'
    };

    return (
      <FormGroup>
        <ControlLabel>Schedule:</ControlLabel>
        <FormControl
          componentClass="select"
          value={type}
          onChange={e => this.changeSchedule('type', e.target.value)}
        >
          <option />{' '}
          {SCHEDULE_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {__(type.label)}
            </option>
          ))}
        </FormControl>
        {type === 'year' ? (
          <FormControl
            componentClass="select"
            value={month}
            onChange={e => this.changeSchedule('month', e.target.value)}
          >
            <option /> {this.generateOptions(12)}
          </FormControl>
        ) : null}
        {type === 'year' || type === 'month' ? (
          <FormControl
            componentClass="select"
            value={day}
            onChange={e => this.changeSchedule('day', e.target.value)}
          >
            <option /> {this.generateOptions(31)}
          </FormControl>
        ) : null}
        <Datetime
          {...props}
          value={time}
          onChange={e => this.changeSchedule('time', e)}
          dateFormat={false}
        />
      </FormGroup>
    );
  }

  render() {
    const { attachments } = this.state.email;

    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <FormGroup>
            <ControlLabel>Message:</ControlLabel>
            <Editor
              onChange={this.props.changeEmail}
              defaultValue={this.state.message}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeUser(e.target.value)}
              value={this.state.fromUser}
            >
              <option />{' '}
              {this.props.users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.fullName || u.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email subject:</ControlLabel>
            <FormControl
              onChange={e => this.changeContent('subject', e.target.value)}
              defaultValue={this.state.email.subject}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email template:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.templateChange(e.target.value)}
              value={this.state.email.templateId}
            >
              <option />{' '}
              {this.props.templates.map(t => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Attachments: </ControlLabel>
            <Uploader
              defaultFileList={attachments}
              onChange={attachments =>
                this.changeContent('attachments', attachments)
              }
            />
          </FormGroup>

          {this.renderScheduler()}
        </FlexPad>

        <FlexItem v="center" h="center" overflow="auto">
          {this.renderMessage()}
        </FlexItem>
      </FlexItem>
    );
  }
}

EmailForm.contextTypes = contextTypes;
EmailForm.propTypes = propTypes;

export default EmailForm;
