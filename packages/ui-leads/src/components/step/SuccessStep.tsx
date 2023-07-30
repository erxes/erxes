import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import EditorCK from '@erxes/ui/src/containers/EditorCK';
import { readFile, uploadHandler, __ } from '@erxes/ui/src/utils';
import { generateEmailTemplateParams } from '@erxes/ui-engage/src/utils';
import { ILeadData } from '../../types';
import { FORM_SUCCESS_ACTIONS } from '@erxes/ui/src/constants/integrations';
import React from 'react';
import Select from 'react-select-plus';
import {
  FlexItem,
  ImagePreview,
  ImageUpload
} from '@erxes/ui/src/components/step/style';
import Uploader from '@erxes/ui/src/components/Uploader';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Spinner from '@erxes/ui/src/components/Spinner';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { IFormData } from '@erxes/ui-forms/src/forms/types';

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
  | 'templateId'
  | 'attachments'
  | 'successImageSize'
  | 'successImage'
  | 'successPreviewStyle';

type Props = {
  type: string;
  color: string;
  theme: string;
  thankTitle?: string;
  thankContent?: string;
  successAction?: string;
  onChange: (name: Name, value: any) => void;
  leadData?: ILeadData;
  formId?: string;
  emailTemplates: any[] /*change type*/;
  successImage?: string;
  successPreviewStyle?: { opacity?: string };
  successImageSize?: string;
  formData: IFormData;
};

type State = {
  successAction?: string;
  leadData?: ILeadData;
};

class SuccessStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const leadData = props.leadData || {};

    this.state = {
      successAction: leadData.successAction || FORM_SUCCESS_ACTIONS.ONPAGE,
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

  onEditorChange = (e, propName) => {
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

    this.setState({ leadData: { userEmailContent, templateId: e.value } });

    this.props.onChange('userEmailContent', this.findTemplate(e.value));
    this.props.onChange('templateId', e.value);
  };

  onChangeAttachment = attachments => {
    const leadData = this.state.leadData || {};
    leadData.attachments = attachments;

    this.setState({ leadData });

    this.props.onChange('attachments', attachments);
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

        {isEnabled('engages') && (
          <FormGroup>
            <label>Email templates:</label>
            <p>{__('Insert email template to content')}</p>

            <Select
              value={leadData.templateId}
              onChange={this.templateChange}
              options={generateEmailTemplateParams(this.props.emailTemplates)}
              clearable={false}
            />
          </FormGroup>
        )}
        <FormGroup>
          <label>Message</label>
          <EditorCK
            content={leadData.userEmailContent || ''}
            onChange={e => this.onEditorChange(e, 'userEmailContent')}
            height={500}
            name={`lead_user_email_${editorSubName}`}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Attachments: </ControlLabel>
          <Uploader
            defaultFileList={leadData.attachments || []}
            onChange={this.onChangeAttachment}
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
            onChange={e => this.onEditorChange(e, 'adminEmailContent')}
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
    const { thankContent, thankTitle, successImageSize } = this.props;
    const { successAction } = this.state;

    const onChangeImageWidth = e =>
      this.onChangeFunction(
        'successImageSize',
        (e.currentTarget as HTMLInputElement).value
      );

    const onChangeTitle = e => {
      this.onChangeFunction(
        'thankTitle',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    const onChangeContent = e => {
      this.onChangeFunction(
        'thankContent',
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
            onChange={onChangeTitle}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Confirmation message</ControlLabel>
          <FormControl
            id="thankContent"
            type="text"
            componentClass="textarea"
            defaultValue={thankContent}
            onChange={onChangeContent}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Featured image</ControlLabel>
          <p>{__('You can upload only image file')}</p>
          {this.renderUploadImage()}
        </FormGroup>
        <FormGroup>
          <ControlLabel>Confirm image size</ControlLabel>
          <FormControl
            id="validation"
            componentClass="select"
            value={successImageSize}
            onChange={onChangeImageWidth}
          >
            <option value="100%">{__('Full width')}</option>
            <option value="50%">{__('Half width')}</option>
          </FormControl>
        </FormGroup>
      </div>
    );
  }

  renderSelectOptions() {
    const hasEmailField = this.props.formData.fields?.find(
      e => e.type === 'email' || e.validation === 'email'
    );

    return FORM_SUCCESS_ACTIONS.ALL_LIST.map(e => {
      if (e.value === 'email' && !hasEmailField) {
        return null;
      }

      return (
        <option key={e.value} value={e.value}>
          {e.text}
        </option>
      );
    });
  }

  removeImage = () => {
    this.props.onChange('successImage', '');
  };

  handleImage = (e: React.FormEvent<HTMLInputElement>) => {
    const imageFile = e.currentTarget.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.props.onChange('successPreviewStyle', { opacity: '0.9' });
      },

      afterUpload: ({ response }) => {
        this.props.onChange('successPreviewStyle', { opacity: '1' });

        this.props.onChange('successImage', response);
      }
    });
  };

  renderImagePreview() {
    const { successImage, successPreviewStyle } = this.props;

    if (successPreviewStyle && successPreviewStyle.opacity === '0.9') {
      return <Spinner />;
    }

    if (!successImage) {
      return (
        <>
          <Icon icon="plus" />
          {__('Upload')}
        </>
      );
    }

    return <ImagePreview src={readFile(successImage)} alt="previewImage" />;
  }

  renderUploadImage() {
    const { successImage } = this.props;

    const onChange = (e: React.FormEvent<HTMLInputElement>) =>
      this.handleImage(e);

    const onClick = () => this.removeImage();

    return (
      <ImageUpload>
        <label>
          <input
            type="file"
            onChange={onChange}
            accept="image/x-png,image/jpeg"
          />
          {this.renderImagePreview()}
        </label>

        {successImage && (
          <Button
            btnStyle="link"
            icon="cancel"
            size="small"
            onClick={onClick}
          />
        )}
      </ImageUpload>
    );
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
