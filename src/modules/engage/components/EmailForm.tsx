import EditorCK from 'modules/common/components/EditorCK';
import ErrorMsg from 'modules/common/components/ErrorMsg';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import HelpPopover from 'modules/common/components/HelpPopover';
import Icon from 'modules/common/components/Icon';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import Tip from 'modules/common/components/Tip';
import Uploader from 'modules/common/components/Uploader';
import { ISelectedOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import {
  EditorContainer,
  VerifyCancel,
  VerifyCheck,
  VerifyStatus
} from 'modules/engage/styles';
import React from 'react';
import Select from 'react-select-plus';
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

    const onChangeUser = (value: ISelectedOption) => {
      const userId = value ? value.value : '';

      this.changeUser(userId);
    };

    const selectOptions = () => {
      const { users, verifiedEmails } = this.props;
      const options: any[] = [];

      users.map(user =>
        options.push({
          value: user._id,
          label: (user.details && user.details.fullName) || user.username,
          disabled: !verifiedEmails.includes(user.email)
        })
      );

      return options;
    };

    const optionRenderer = option => (
      <VerifyStatus>
        {!option.disabled ? (
          <Tip placement="auto" text="Email verified">
            <VerifyCheck>
              <Icon icon="check-circle" />
            </VerifyCheck>
          </Tip>
        ) : (
          <Tip placement="auto" text="Email not verified">
            <VerifyCancel>
              <Icon icon="times-circle" />
            </VerifyCancel>
          </Tip>
        )}
        {option.label}
      </VerifyStatus>
    );

    return (
      <Select
        placeholder={__('Choose users')}
        value={this.state.fromUserId}
        onChange={onChangeUser}
        optionRenderer={optionRenderer}
        options={selectOptions()}
      />
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
            <ControlLabel>
              From:
              <HelpPopover title="The email address is not verified (x) by Amazon Ses services.">
                <div>
                  If you want to verify your email:
                  <ol>
                    <li>Log in to your AWS Management Console</li>
                    <li>Click on the Services menu from the dropdown menu</li>
                    <li>
                      Click on the Simple Email Services menu from the left
                      sidebar
                    </li>
                    <li>
                      Click on the Email Addresses menu from the left sidebar
                    </li>
                    <li>
                      Finally, click on the button that named "Verify a new
                      email address"
                    </li>
                  </ol>
                </div>
              </HelpPopover>
            </ControlLabel>
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
