import EditorCK from 'modules/common/components/EditorCK';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import Uploader from 'modules/common/components/Uploader';
import { __, Alert } from 'modules/common/utils';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import { EditorContainer } from 'modules/engage/styles';
import React from 'react';
import ErrorMsg from '../../common/components/ErrorMsg';
import { IEmailFormProps, IEngageEmail, IEngageScheduleDate } from '../types';
import Scheduler from './Scheduler';

type Props = IEmailFormProps & { verifiedEmails: string[]; error?: string };

type State = {
  fromUserId: string;
  content: string;
  email: IEngageEmail;
  scheduleDate?: IEngageScheduleDate;
};

class EmailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      fromUserId: props.fromUserId,
      content: props.content,
      email: props.email,
      scheduleDate: props.scheduleDate
    };
  }

  changeContent = (key, value) => {
    const email = { ...this.state.email } as IEngageEmail;

    email[key] = value;

    this.setState({ email });

    this.props.onChange('email', email);
  };

  changeUser = (fromUserId: string) => {
    const { verifiedEmails, users } = this.props;

    const user = users.find(u => u._id === fromUserId);

    if (!user || !verifiedEmails.includes(user.email)) {
      this.setState({ fromUserId: '' });
      return Alert.error('Email not verified');
    }

    Alert.success('Email is verified');

    this.setState({ fromUserId });
    this.props.onChange('fromUserId', fromUserId);
  };

  templateChange = value => {
    const email = { ...this.state.email } as IEngageEmail;

    email.templateId = value;

    this.setState({ content: this.findTemplate(value), email }, () => {
      this.props.onChange('email', this.state.email);
    });
  };

  findTemplate = id => {
    const template = this.props.templates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return '';
  };

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

  onEditorChange = e => {
    this.props.onChange('content', e.editor.getData());
  };

  renderFrom() {
    const { error } = this.props;

    if (error) {
      return <ErrorMsg>{error}</ErrorMsg>;
    }

    const onChangeUser = e =>
      this.changeUser((e.target as HTMLInputElement).value);

    return (
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
    );
  }

  render() {
    const { attachments } = this.state.email;

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
            <ControlLabel>From:</ControlLabel>
            {this.renderFrom()}
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
            <p>{__('Insert email template to content')}</p>
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

        <FlexItem overflow="auto" count="2">
          <EditorContainer>
            <ControlLabel>Content:</ControlLabel>
            <EditorCK
              content={this.state.content}
              onChange={this.onEditorChange}
              insertItems={EMAIL_CONTENT}
              height={500}
            />
          </EditorContainer>
        </FlexItem>
      </FlexItem>
    );
  }
}

export default EmailForm;
