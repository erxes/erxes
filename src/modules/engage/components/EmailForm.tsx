import {
  ControlLabel,
  FormControl,
  FormGroup,
  Uploader
} from 'modules/common/components';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { EMAIL_CONTENT_CLASS } from 'modules/engage/constants';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import styled from 'styled-components';
import { IUser } from '../../auth/types';
import { IEmailTemplate } from '../../settings/emailTemplates/types';
import Editor from './Editor';
import Scheduler from './Scheduler';

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

type Props = {
  changeEmail: (name: string, value: any) => void;
  message?: string;
  users: IUser[];
  templates: IEmailTemplate[];
  defaultValue: any;
  kind: string;
};

type State = {
  fromUser: string;
  currentTemplate: string;
  message: any;
  email: { subject: string, templateId: string, attachments: any[] };
  scheduleDate: Date;
}

class EmailForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const message = this.props.defaultValue || {};
    const scheduleDate = message.scheduleDate || {};

    this.state = {
      fromUser: message.fromUser || '',
      currentTemplate: '',
      message: message.message,
      email: {
        subject: message.email.subject || '',
        templateId: message.email.templateId || '',
        attachments: message.email.attachments || []
      },
      scheduleDate
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
    const email = { ...this.state.email };

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
    if (this.props.kind === 'manual') {
      return null;
    }

    return (
      <Scheduler
        scheduleDate={this.state.scheduleDate}
        onChange={this.props.changeEmail}
      />
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
              onChange={e => this.changeUser((e.target as HTMLInputElement).value)}
              value={this.state.fromUser}
            >
              <option />{' '}

              {this.props.users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.details ? user.details.fullName : user.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email subject:</ControlLabel>
            <FormControl
              onChange={e => this.changeContent('subject', (e.target as HTMLInputElement).value)}
              defaultValue={this.state.email.subject}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email template:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.templateChange((e.target as HTMLInputElement).value)}
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

export default EmailForm;
