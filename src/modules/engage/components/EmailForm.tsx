import {
  ControlLabel,
  FormControl,
  FormGroup,
  Uploader
} from 'modules/common/components';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { EMAIL_CONTENT_CLASS } from 'modules/engage/constants';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import styled from 'styled-components';
import * as xss from 'xss';
import { IUser } from '../../auth/types';
import { IEmailTemplate } from '../../settings/emailTemplates/types';
import { IEngageEmail, IEngageScheduleDate } from '../types';
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
  onChange: (
    name: 'email' | 'content' | 'fromUserId' | 'scheduleDate',
    value: IEngageEmail | IEngageScheduleDate | string
  ) => void;
  message?: string;
  users: IUser[];
  templates: IEmailTemplate[];
  kind: string;
  email: IEngageEmail;
  fromUserId: string;
  content: string;
  scheduleDate: IEngageScheduleDate;
};

type State = {
  fromUserId: string;
  currentTemplate: string;
  content: string;
  email: IEngageEmail;
  scheduleDate?: IEngageScheduleDate;
};

class EmailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      fromUserId: props.fromUserId,
      currentTemplate: '',
      content: props.content,
      email: props.email,
      scheduleDate: props.scheduleDate
    };
  }

  componentDidMount() {
    if (this.props.email) {
      this.templateChange(this.props.email.templateId);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.content !== prevProps.content ||
      this.state.currentTemplate !== prevState.currentTemplate
    ) {
      this.renderBuilder();
    }
  }

  changeContent = (key, value) => {
    const email = { ...this.state.email } as IEngageEmail;

    email[key] = value;

    this.setState({ email });

    this.props.onChange('email', email);
  };

  changeUser = fromUserId => {
    this.setState({ fromUserId });
    this.props.onChange('fromUserId', fromUserId);
  };

  templateChange = value => {
    this.changeContent('templateId', value);
    this.setState({ currentTemplate: this.findTemplate(value) });
    this.renderBuilder();
  };

  findTemplate = id => {
    const template = this.props.templates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return '';
  };

  renderBuilder() {
    const contentContainer = document.getElementsByClassName(
      EMAIL_CONTENT_CLASS
    );

    // render editor to content
    if (contentContainer.length > 0) {
      ReactDom.render(
        <EmailContent
          dangerouslySetInnerHTML={{
            __html: xss(this.props.content || '')
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
        scheduleDate={this.state.scheduleDate || ({} as IEngageScheduleDate)}
        onChange={this.props.onChange}
      />
    );
  }

  render() {
    const { attachments } = this.state.email;

    const onChangeUser = e =>
      this.changeUser((e.target as HTMLInputElement).value);
    const onChangeContent = e =>
      this.changeContent('subject', (e.target as HTMLInputElement).value);
    const onChangeTemplate = e =>
      this.templateChange((e.target as HTMLInputElement).value);
    const onChangeAttachment = attachmentsArr =>
      this.changeContent('attachments', attachmentsArr);

    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <FormGroup>
            <ControlLabel>Message:</ControlLabel>
            <Editor
              onChange={this.props.onChange}
              defaultValue={this.state.content}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={onChangeUser}
              value={this.state.fromUserId}
            >
              <option />{' '}
              {this.props.users.map(user => (
                <option key={user._id} value={user._id}>
                  {(user.details && user.details.fullName) || user.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email subject:</ControlLabel>
            <FormControl
              onChange={onChangeContent}
              defaultValue={this.state.email.subject}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Email template:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={onChangeTemplate}
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
              defaultFileList={attachments || []}
              onChange={onChangeAttachment}
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
