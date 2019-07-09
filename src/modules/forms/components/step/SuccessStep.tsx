import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem, Preview } from 'modules/common/components/step/styles';
import React from 'react';
import { IFormData } from '../../../settings/integrations/types';
import SuccessPreview from './preview/SuccessPreview';
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
  formData?: IFormData;
};

type State = {
  successAction?: string;
};

class SuccessStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const formData = props.formData || {};

    this.state = {
      successAction: formData.successAction || 'onPage'
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

  renderEmailFields(formData: IFormData) {
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

    const userEmailContent = e =>
      this.onChangeFunction(
        'userEmailContent',
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

    const adminEmailContent = e =>
      this.onChangeFunction(
        'adminEmailContent',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <div>
        <FormGroup>
          <ControlLabel>From email</ControlLabel>
          <FormControl
            type="text"
            id="fromEmail"
            defaultValue={formData.fromEmail}
            onChange={fromEmailOnChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User email title</ControlLabel>
          <FormControl
            type="text"
            id="userEmailTitle"
            defaultValue={formData.userEmailTitle}
            onChange={userEmailTitle}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User email content</ControlLabel>
          <FormControl
            componentClass="textarea"
            type="text"
            defaultValue={formData.userEmailContent}
            id="userEmailContent"
            onChange={userEmailContent}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Admin emails</ControlLabel>
          <FormControl
            id="adminEmails"
            type="text"
            defaultValue={
              formData.adminEmails ? formData.adminEmails.join(',') : ''
            }
            onChange={adminEmails}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Admin email title</ControlLabel>
          <FormControl
            type="text"
            defaultValue={formData.adminEmailTitle}
            id="adminEmailTitle"
            onChange={adminEmailTitle}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Admin email content</ControlLabel>
          <FormControl
            componentClass="textarea"
            type="text"
            defaultValue={formData.adminEmailContent}
            id="adminEmailContent"
            onChange={adminEmailContent}
          />
        </FormGroup>
      </div>
    );
  }

  renderRedirectUrl(formData) {
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
            defaultValue={formData.redirectUrl}
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
    const formData = this.props.formData || {};
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

          {this.renderEmailFields(formData)}
          {this.renderRedirectUrl(formData)}
          {this.renderThankContent()}
        </LeftItem>

        <Preview>
          <SuccessPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

export default SuccessStep;
