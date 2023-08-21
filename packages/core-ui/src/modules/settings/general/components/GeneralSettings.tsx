import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Button from 'modules/common/components/Button';
import CollapseContent from 'modules/common/components/CollapseContent';
import { FormControl } from 'modules/common/components/form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import CURRENCIES from '@erxes/ui/src/constants/currencies';
import {
  __,
  uploadHandler,
  readFile,
  loadDynamicComponent
} from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import EmailConfigForm from '@erxes/ui-settings/src/general/components/EmailConfigForm';
import React from 'react';
import Select from 'react-select-plus';
import { ContentBox, Title } from '@erxes/ui-settings/src/styles';
import {
  DATA_RETENTION_DURATION,
  FILE_MIME_TYPES,
  FILE_SYSTEM_TYPES,
  KEY_LABELS,
  LANGUAGES,
  LOG_RETENTION_DURATION,
  SERVICE_TYPES
} from '@erxes/ui-settings/src/general/constants';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import ActivateInstallation from './ActivateInstallation';
import Header from '@erxes/ui-settings/src/general/components/Header';
import { SelectTeamMembers } from '@erxes/ui/src';

type Props = {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  constants;
};

type State = {
  configsMap: IConfigsMap;
  language: string;
  isSaved: boolean;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
      language: props.currentLanguage,
      isSaved: false
    };
  }

  save = e => {
    e.preventDefault();

    const { configsMap, language } = this.state;

    this.setState({ isSaved: true });

    this.props.save(configsMap);

    this.props.changeLanguage(language);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeEmailConfig = (emailConfig: any) => {
    this.onChangeConfig('COMPANY_EMAIL_FROM', emailConfig.email);
    this.onChangeConfig('COMPANY_EMAIL_TEMPLATE_TYPE', emailConfig.type);
    this.onChangeConfig('COMPANY_EMAIL_TEMPLATE', emailConfig.template);
  };

  onChangeMultiCombo = (code: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map(el => el.value);
    }

    this.onChangeConfig(code, value);
  };

  onChangeSingleCombo = (code: string, obj) => {
    this.onChangeConfig(code, obj.value);
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onLanguageChange = language => {
    this.setState({ language: language.value });
  };

  renderItem = (key: string, description?: string, componentClass?: string) => {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          componentClass={componentClass}
          defaultValue={configsMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  onChangeColor = (field, e) => {
    this.onChangeConfig(field, e.hex);
  };

  renderColorPicker = field => {
    const { configsMap } = this.state;
    const value = configsMap[field];

    const popoverContent = (
      <Popover id="color-picker">
        <TwitterPicker
          color={value}
          onChange={this.onChangeColor.bind(this, field)}
          triangle="hide"
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom-start"
        overlay={popoverContent}
      >
        <ColorPick>
          <ColorPicker style={{ backgroundColor: value }} />
        </ColorPick>
      </OverlayTrigger>
    );
  };

  handleLogoChange = (field, e) => {
    const imageFile = e.target.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        return;
      },

      afterUpload: ({ response }) => {
        this.onChangeConfig(field, response);
      },

      afterRead: ({ result }) => {
        return;
      }
    });
  };

  renderUploadImage(field, description?) {
    const { configsMap } = this.state;
    const value = configsMap[field];

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[field]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        {value ? (
          <p>
            <img alt={field} src={readFile(value)} />
          </p>
        ) : null}
        <input type="file" onChange={this.handleLogoChange.bind(this, field)} />
      </FormGroup>
    );
  }

  renderConstant(kind: string) {
    const { constants } = this.props;
    const { configsMap } = this.state;
    const allValues = constants.allValues || {};
    const defaultValues = constants.defaultValues || {};

    const constant = allValues[kind] || [];

    let value = configsMap[kind];

    if (!value || value.length === 0) {
      value = defaultValues[kind] || '';
    }

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[kind]}</ControlLabel>

        <Select
          options={constant}
          value={value}
          onChange={this.onChangeMultiCombo.bind(this, kind)}
          multi={true}
        />
      </FormGroup>
    );
  }

  render() {
    const { configsMap, language } = this.state;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General system config') }
    ];

    const actionButtons = (
      <Button
        id="generalSettingsSave"
        btnStyle="success"
        onClick={this.save}
        icon="check-circle"
      >
        Save
      </Button>
    );

    const mimeTypeOptions = FILE_MIME_TYPES.map(item => ({
      value: item.value,
      label: `${item.label} (${item.extension})`
    }));
    const mimeTypeDesc = __(
      'Comma-separated list of media types. Leave it blank for accepting all media types'
    );

    const content = (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent title={__('General settings')}>
          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <Select
              options={LANGUAGES}
              value={language}
              onChange={this.onLanguageChange}
              searchable={false}
              clearable={false}
              placeholder={__('Select')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Currency</ControlLabel>
            <Select
              options={CURRENCIES}
              value={configsMap.dealCurrency}
              onChange={this.onChangeMultiCombo.bind(this, 'dealCurrency')}
              multi={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>
              {__('Team members who can access every branches')}
            </ControlLabel>
            <SelectTeamMembers
              name="BRANCHES_MASTER_TEAM_MEMBERS_IDS"
              initialValue={configsMap.BRANCHES_MASTER_TEAM_MEMBERS_IDS}
              label="Select team members"
              onSelect={(values, name) => this.onChangeConfig(name, values)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>
              {__('Team members who can access every departments')}
            </ControlLabel>
            <SelectTeamMembers
              name="DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS"
              label="Select team members"
              initialValue={configsMap.DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS}
              onSelect={(values, name) => this.onChangeConfig(name, values)}
            />
          </FormGroup>
        </CollapseContent>

        <CollapseContent title={__('Theme')}>
          {this.renderUploadImage(
            'THEME_LOGO',
            'Transparent PNG, around 3:1 aspect ratio. Max width: 600px.'
          )}
          {this.renderUploadImage('THEME_FAVICON', '16x16px transparent PNG.')}

          {this.renderItem('THEME_MOTTO', '', 'textarea')}

          {this.renderItem('THEME_LOGIN_PAGE_DESCRIPTION', '', 'textarea')}

          <FormGroup>
            <ControlLabel>{__('Text color')}</ControlLabel>
            <p>{__('Used on the login page text')}</p>
            {this.renderColorPicker('THEME_TEXT_COLOR')}
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Background')}</ControlLabel>
            <p>{__('Used on the login background')}</p>
            {this.renderColorPicker('THEME_BACKGROUND')}
          </FormGroup>
        </CollapseContent>

        <CollapseContent title={__('File upload')}>
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#file-upload"
              rel="noopener noreferrer"
            >
              {__('Learn how to set file uploading') + '.'}
            </a>
          </Info>
          <FormGroup>
            <ControlLabel>{KEY_LABELS.UPLOAD_FILE_TYPES}</ControlLabel>
            {mimeTypeDesc && <p>{__(mimeTypeDesc)}</p>}
            <Select
              value={configsMap.UPLOAD_FILE_TYPES}
              options={mimeTypeOptions}
              onChange={this.onChangeMultiCombo.bind(this, 'UPLOAD_FILE_TYPES')}
              multi={true}
              delimiter=","
              simpleValue={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{KEY_LABELS.WIDGETS_UPLOAD_FILE_TYPES}</ControlLabel>
            {mimeTypeDesc && <p>{__(mimeTypeDesc)}</p>}
            <Select
              value={configsMap.WIDGETS_UPLOAD_FILE_TYPES}
              options={mimeTypeOptions}
              onChange={this.onChangeMultiCombo.bind(
                this,
                'WIDGETS_UPLOAD_FILE_TYPES'
              )}
              multi={true}
              delimiter=","
              simpleValue={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{KEY_LABELS.UPLOAD_SERVICE_TYPE}</ControlLabel>
            <Select
              options={SERVICE_TYPES}
              value={configsMap.UPLOAD_SERVICE_TYPE || 'AWS'}
              clearable={false}
              onChange={this.onChangeSingleCombo.bind(
                this,
                'UPLOAD_SERVICE_TYPE'
              )}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{KEY_LABELS.FILE_SYSTEM_PUBLIC}</ControlLabel>
            <Select
              options={FILE_SYSTEM_TYPES}
              value={configsMap.FILE_SYSTEM_PUBLIC || 'true'}
              clearable={false}
              searchable={false}
              onChange={this.onChangeSingleCombo.bind(
                this,
                'FILE_SYSTEM_PUBLIC'
              )}
            />
          </FormGroup>
        </CollapseContent>

        <CollapseContent title={__('Google Cloud Storage')}>
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#google-cloud-storage"
              rel="noopener noreferrer"
            >
              {__(
                'Learn how to create or find your Google Cloud Storage bucket'
              )}
            </a>
          </Info>
          <FormGroup>
            <ControlLabel>Google Bucket Name</ControlLabel>
            {this.renderItem('GOOGLE_CLOUD_STORAGE_BUCKET')}
          </FormGroup>
        </CollapseContent>

        <CollapseContent title="AWS S3">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#aws-s3"
              rel="noopener noreferrer"
            >
              {__('Learn how to set AWS S3 Variables')}
            </a>
          </Info>
          {this.renderItem('AWS_ACCESS_KEY_ID')}
          {this.renderItem('AWS_SECRET_ACCESS_KEY')}
          {this.renderItem('AWS_BUCKET')}
          {this.renderItem('AWS_PREFIX')}
          {this.renderItem(
            'AWS_COMPATIBLE_SERVICE_ENDPOINT',
            __('Used when using s3 compatible service')
          )}
          {this.renderItem('AWS_FORCE_PATH_STYLE')}
        </CollapseContent>

        <CollapseContent title="AWS SES">
          <Info>
            <p>
              {__(
                'In this field, the AWS SES configuration is dedicated to providing transaction emails'
              ) + '.'}
            </p>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#aws-ses"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Amazon SES variables')}
            </a>
          </Info>
          {this.renderItem('AWS_SES_ACCESS_KEY_ID')}
          {this.renderItem('AWS_SES_SECRET_ACCESS_KEY')}
          {this.renderItem('AWS_REGION')}
          {this.renderItem('AWS_SES_CONFIG_SET')}
        </CollapseContent>

        <CollapseContent title="Google">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#google"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Google variables')}
            </a>
          </Info>
          {this.renderItem('GOOGLE_PROJECT_ID')}
          {this.renderItem('GOOGLE_CLIENT_ID')}
          {this.renderItem('GOOGLE_CLIENT_SECRET')}
          {this.renderItem(
            'GOOGLE_GMAIL_TOPIC',
            'The topic value created in Gmail setup'
          )}

          {this.renderItem(
            'GOOGLE_APPLICATION_CREDENTIALS_JSON',
            'Firebase config for notifications'
          )}
          {this.renderItem('GOOGLE_MAP_API_KEY', 'Google Map Api Key')}
        </CollapseContent>

        <CollapseContent title={__('Common mail config')}>
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#common-mail-config"
              rel="noopener noreferrer"
            >
              {__('Learn more about Email Settings')}
            </a>
          </Info>

          <EmailConfigForm
            emailConfig={{
              email: configsMap.COMPANY_EMAIL_FROM,
              type: configsMap.COMPANY_EMAIL_TEMPLATE_TYPE,
              template: configsMap.COMPANY_EMAIL_TEMPLATE
            }}
            emailText="Set an email address you wish to send your internal transactional emails from. For example, task notifications, team member mentions, etc."
            setEmailConfig={this.onChangeEmailConfig}
            isSaved={this.state.isSaved}
          />
          <FormGroup>
            <ControlLabel>DEFAULT EMAIL SERVICE</ControlLabel>
            <p>
              {__(
                'Choose your email service name. The default email service is SES.'
              )}
            </p>
            <Select
              options={[
                { label: 'SES', value: 'SES' },
                { label: 'Custom', value: 'custom' }
              ]}
              value={configsMap.DEFAULT_EMAIL_SERVICE || 'SES'}
              clearable={false}
              searchable={false}
              onChange={this.onChangeSingleCombo.bind(
                this,
                'DEFAULT_EMAIL_SERVICE'
              )}
            />
          </FormGroup>
        </CollapseContent>

        <CollapseContent title={__('Custom mail service')}>
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#custom-mail-service"
              rel="noopener noreferrer"
            >
              {__('Learn the case of custom email service')}
            </a>
          </Info>
          {this.renderItem('MAIL_SERVICE')}
          {this.renderItem('MAIL_PORT')}
          {this.renderItem('MAIL_USER')}
          {this.renderItem('MAIL_PASS')}
          {this.renderItem('MAIL_HOST')}
        </CollapseContent>

        <CollapseContent title={__('Data retention')}>
          <ControlLabel>{KEY_LABELS.NOTIFICATION_DATA_RETENTION}</ControlLabel>
          <Select
            options={DATA_RETENTION_DURATION}
            value={configsMap.NOTIFICATION_DATA_RETENTION || 3}
            clearable={false}
            searchable={false}
            onChange={this.onChangeSingleCombo.bind(
              this,
              'NOTIFICATION_DATA_RETENTION'
            )}
          />
          <ControlLabel>{KEY_LABELS.LOG_DATA_RETENTION}</ControlLabel>
          <Select
            options={LOG_RETENTION_DURATION}
            value={configsMap.LOG_DATA_RETENTION || 1}
            clearable={false}
            searchable={false}
            onChange={this.onChangeSingleCombo.bind(this, 'LOG_DATA_RETENTION')}
          />
        </CollapseContent>

        <CollapseContent title={__('Constants')}>
          {this.renderConstant('sex_choices')}
          {this.renderConstant('company_industry_types')}
          {this.renderConstant('social_links')}
        </CollapseContent>

        <CollapseContent title={__('Connectivity Services')}>
          <ActivateInstallation />
        </CollapseContent>

        <CollapseContent title="MessagePro">
          {this.renderItem('MESSAGE_PRO_API_KEY')}
          {this.renderItem('MESSAGE_PRO_PHONE_NUMBER')}
        </CollapseContent>

        {loadDynamicComponent(
          'extendSystemConfig',
          { ...this.props, onChangeConfig: this.onChangeConfig },
          true
        )}
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('General system config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <Header
            title="System config"
            description={
              __(
                'Set up your initial account settings so that things run smoothly in unison'
              ) + '.'
            }
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('General system config')}</Title>}
            right={actionButtons}
          />
        }
        content={content}
        hasBorder
      />
    );
  }
}

export default GeneralSettings;
