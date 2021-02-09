import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem } from 'modules/common/components/step/styles';
import EditorCK from 'modules/common/containers/EditorCK';
import { ILeadData } from 'modules/leads/types';
import React from 'react';
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
  | 'thankContent';

type Props = {
  type: string;
  color: string;
  theme: string;
  thankContent?: string;
  successAction?: string;
  onChange: (name: Name, value: string) => void;
  leadData?: ILeadData;
  formId?: string;
};

type State = {
  successAction?: string;
};

class SuccessStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const leadData = props.leadData || {};

    this.state = {
      successAction: leadData.successAction || 'onPage'
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
          <ControlLabel>From email</ControlLabel>
          <FormControl
            type="text"
            id="fromEmail"
            defaultValue={leadData.fromEmail}
            onChange={fromEmailOnChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User email title</ControlLabel>
          <FormControl
            type="text"
            id="userEmailTitle"
            defaultValue={leadData.userEmailTitle}
            onChange={userEmailTitle}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User email content</ControlLabel>
          <EditorCK
            content={leadData.userEmailContent || ''}
            onChange={this.onEditorChange}
            height={500}
            name={`lead_user_email_${editorSubName}`}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Admin emails</ControlLabel>
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
          <ControlLabel>Admin email title</ControlLabel>
          <FormControl
            type="text"
            defaultValue={leadData.adminEmailTitle}
            id="adminEmailTitle"
            onChange={adminEmailTitle}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Admin email content</ControlLabel>
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
          <ControlLabel>Redirect url</ControlLabel>
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
    const { thankContent } = this.props;
    const { successAction } = this.state;

    const onChange = e =>
      this.onChangeFunction(
        'thankContent',
        (e.currentTarget as HTMLInputElement).value
      );

    if (successAction !== 'onPage') {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Thank content</ControlLabel>
        <FormControl
          id="thankContent"
          type="text"
          componentClass="textarea"
          defaultValue={thankContent}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  render() {
    const leadData = this.props.leadData || {};
    const { successAction } = this.state;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>On success</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={successAction}
              onChange={this.handleSuccessActionChange}
              id="successAction"
            >
              <option />
              <option>email</option>
              <option>redirect</option>
              <option>onPage</option>
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
