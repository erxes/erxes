import React, { Component } from 'react';
import styled from 'styled-components';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';
import { EMAIL_CONTENT_CLASS } from 'modules/engage/constants';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import Editor from './Editor';
import { Divider } from './step/style';

const PreviewContainer = styled.div`
  margin: 20px;
  height: 100%;
  p {
    padding: 20px;
  }
`;

const EmailContent = styled.div`
  p {
    padding: 20px 40px;
    margin: 0px;
  }
`;

const propTypes = {
  changeEmail: PropTypes.func,
  message: PropTypes.string,
  users: PropTypes.array,
  templates: PropTypes.array,
  defaultValue: PropTypes.object
};

class EmailForm extends Component {
  constructor(props) {
    super(props);

    const message = this.props.defaultValue || {};

    this.state = {
      fromUser: message.fromUser,
      currentTemplate: '',
      message: message.message,
      email: {
        subject: message.email.subject,
        templateId: message.email.templateId
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

  findTemplate(id) {
    const template = this.props.templates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return '';
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
    if (this.state.currentTemplate !== '') {
      return (
        <PreviewContainer
          dangerouslySetInnerHTML={{
            __html: this.state.currentTemplate
          }}
        />
      );
    }

    return null;
  }

  render() {
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
              defaultValue={this.state.fromUser}
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
              defaultValue={this.state.email.templateId}
            >
              <option />{' '}
              {this.props.templates.map(t => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
        </FlexPad>
        <Divider />
        <FlexItem v="center" h="center" overflow="auto">
          {this.renderMessage()}
        </FlexItem>
      </FlexItem>
    );
  }
}

EmailForm.propTypes = propTypes;

export default EmailForm;
