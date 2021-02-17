import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem } from 'modules/common/components/step/styles';
import EditorCK from 'modules/common/containers/EditorCK';
import { __ } from 'modules/common/utils';
import { generateEmailTemplateParams } from 'modules/engage/utils';
import { ILeadData } from 'modules/leads/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import { FORM_SUCCESS_ACTIONS } from 'modules/settings/integrations/constants';
import React from 'react';
import Select from 'react-select-plus';
import { FlexItem } from './style';

type Name =
  | 'successAction'
  | 'fromEmail'
  | 'userEmailTitle'
  | 'userEmailContent'
  | 'adminEmails'
  | 'adminEmailTitle'
  | 'adminEmailContent'
  | 'redirectUrl'
  | 'thankContent'
  | 'thankTitle'
  | 'templateId';

type Props = {
  type: string;
  color: string;
  theme: string;
  thankTitle?: string;
  thankContent?: string;
  successAction?: string;
  onChange: (name: Name, value: string) => void;
  leadData?: ILeadData;
  formId?: string;
  templateId?: string;
  emailTemplates: IEmailTemplate[];
};

type State = {
  successAction?: string;
  templateId?: string;
  leadData?: ILeadData;
};

class SuccessStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const leadData = props.leadData || {};

    this.state = {
      successAction: leadData.successAction || FORM_SUCCESS_ACTIONS.ONPAGE,
      templateId: this.props.templateId,
      leadData
    };
  }

  handleSuccessActionChange = () => {
    const element = document.getElementById(
      'successAction'
    ) as HTMLInputElement;
    const value = element.value;

    this.setState({ successAction: value });
    this.props.onChange('successAction', value);
  };

  onChangeFunction = (name: Name, value: string) => {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  };

  onEditorChange = e => {
    let propName: Name = 'adminEmailContent';

    if (e.editor.id === 'cke_1') {
      propName = 'userEmailContent';
    }
    this.props.onChange(propName, e.editor.getData());
  };

  findTemplate = id => {
    const template = this.props.emailTemplates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return '';
  };

  templateChange = e => {
    const userEmailContent = this.findTemplate(e.value);

    this.setState({ templateId: e.value, leadData: { userEmailContent } });

    this.props.onChange('userEmailContent', this.findTemplate(e.value));
  };

  renderEmailFields(leadData: ILeadData) {
    if (this.state.successAction !== 'email') {
      return null;
    }

    const fromEmailOnChange = e =>
      this.onChangeFunction(
        'fromEmail',
        (e.currentTarget as HTMLInputElement).value
      );

    const userEmailTitle = e =>
      this.onChangeFunction(
        'userEmailTitle',
        (e.currentTarget as HTMLInputElement).value
      );

    const adminEmails = e =>
      this.onChangeFunction(
        'adminEmails',
        (e.currentTarget as HTMLInputElement).value
      );

    const adminEmailTitle = e =>
      this.onChangeFunction(
        'adminEmailTitle',
        (e.currentTarget as HTMLInputElement).value
      );

    const { type, formId } = this.props;
    const editorSubName = `${type}_${formId || 'create'}`;

    return (
      <div>
        <FormGroup>
          <ControlLabel>
            Send a confirmation email to the responder
          </ControlLabel>
        </FormGroup>
        <FormGroup>
          <label>Send from</label>
          <FormControl
            type="text"
            id="fromEmail"
            defaultValue={leadData.fromEmail}
            onChange={fromEmailOnChange}
          />
        </FormGroup>

        <FormGroup>
          <label>Subject Line</label>
          <FormControl
            type="text"
            id="userEmailTitle"
            defaultValue={leadData.userEmailTitle}
            onChange={userEmailTitle}
          />
        </FormGroup>

        <FormGroup>
          <label>Email templates:</label>
          <p>{__('Insert email template to content')}</p>

          <Select
            value={this.state.templateId}
            onChange={this.templateChange}
            options={generateEmailTemplateParams(this.props.emailTemplates)}
            clearable={false}
          />
        </FormGroup>

        <FormGroup>
          <label>Message</label>
          <EditorCK
            content={leadData.userEmailContent || ''}
            onChange={this.onEditorChange}
            height={500}
            name={`lead_user_email_${editorSubName}`}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Get email notifications for new responses</ControlLabel>
        </FormGroup>

        <FormGroup>
          <label>Admin emails</label>
          <FormControl
            id="adminEmails"
            type="text"
            defaultValue={
              leadData.adminEmails ? leadData.adminEmails.join(',') : ''
            }
            onChange={adminEmails}
          />
        </FormGroup>

        <FormGroup>
          <label>Subject Line</label>
          <FormControl
            type="text"
            defaultValue={leadData.adminEmailTitle}
            id="adminEmailTitle"
            onChange={adminEmailTitle}
          />
        </FormGroup>

        <FormGroup>
          <label>Message</label>
          <EditorCK
            content={leadData.adminEmailContent || ''}
            onChange={this.onEditorChange}
            height={500}
            name={`lead_admin_email_${editorSubName}`}
          />
        </FormGroup>
      </div>
    );
  }

  renderRedirectUrl(leadData) {
    if (this.state.successAction !== 'redirect') {
      return null;
    }

    const onChange = e =>
      this.onChangeFunction(
        'redirectUrl',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <div>
        <FormGroup>
          <ControlLabel>Redirect to this page after submission</ControlLabel>
          <FormControl
            type="text"
            defaultValue={leadData.redirectUrl}
            id="redirectUrl"
            onChange={onChange}
          />
        </FormGroup>
      </div>
    );
  }

  renderThankContent() {
    const { thankContent, thankTitle } = this.props;
    const { successAction } = this.state;

    const onChange = e => {
      this.onChangeFunction(
        e.currentTarget.id,
        (e.currentTarget as HTMLInputElement).value
      );
    };

    if (successAction !== FORM_SUCCESS_ACTIONS.ONPAGE) {
      return null;
    }

    return (
      <div>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="thankTitle"
            type="text"
            componentClass="textinput"
            defaultValue={thankTitle}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Confirmation message</ControlLabel>
          <FormControl
            id="thankContent"
            type="text"
            componentClass="textarea"
            defaultValue={thankContent}
            onChange={onChange}
          />
        </FormGroup>
      </div>
    );
  }

  renderSelectOptions() {
    return FORM_SUCCESS_ACTIONS.ALL_LIST.map(e => {
      return (
        <option key={e.value} value={e.value}>
          {e.text}
        </option>
      );
    });
  }

  render() {
    const leadData = this.state.leadData || {};
    const { successAction } = this.state;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Confirmation message type</ControlLabel>
            <p>
              {__(`You can set only one confirmation message type at a time.`)}
            </p>
            <FormControl
              componentClass="select"
              defaultValue={successAction}
              onChange={this.handleSuccessActionChange}
              id="successAction"
            >
              {this.renderSelectOptions()}
            </FormControl>
          </FormGroup>

          {this.renderEmailFields(leadData)}
          {this.renderRedirectUrl(leadData)}
          {this.renderThankContent()}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default SuccessStep;
