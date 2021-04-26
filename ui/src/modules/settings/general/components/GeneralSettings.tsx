import Button from 'modules/common/components/Button';
import CollapseContent from 'modules/common/components/CollapseContent';
import { FormControl } from 'modules/common/components/form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import CURRENCIES from 'modules/common/constants/currencies';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import EmailConfigForm from 'modules/settings/general/components/EmailConfigForm';
import React from 'react';
import Select from 'react-select-plus';
import { ContentBox } from '../../styles';
import {
  DATA_RETENTION_DURATION,
  FILE_MIME_TYPES,
  FILE_SYSTEM_TYPES,
  KEY_LABELS,
  LANGUAGES,
  MEASUREMENTS,
  SERVICE_TYPES
} from '../constants';
import { IConfigsMap } from '../types';
import ActivateInstallation from './ActivateInstallation';
import Header from './Header';
import Sidebar from './Sidebar';

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

  renderItem = (key: string, description?: string) => {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={configsMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

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
        btnStyle="primary"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
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
            <ControlLabel>Unit of measurement</ControlLabel>
            <Select
              options={MEASUREMENTS}
              value={configsMap.dealUOM}
              onChange={this.onChangeMultiCombo.bind(this, 'dealUOM')}
              multi={true}
            />
          </FormGroup>
        </CollapseContent>

        <CollapseContent title={__('File upload')}>
          <Info>
            <a
              target="_blank"
              href="https://erxes.org/administrator/system-config#file-upload"
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

        <CollapseContent title="Google Cloud Storage">
          <Info>
            <a
              target="_blank"
              href="https://erxes.org/administrator/system-config#google-cloud-storage"
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
              href="https://erxes.org/administrator/system-config#aws-s3"
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
              href="https://erxes.org/administrator/system-config#aws-ses"
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
              href="https://erxes.org/administrator/system-config#google"
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
        </CollapseContent>

        <CollapseContent title={__('Common mail config')}>
          <Info>
            <a
              target="_blank"
              href="https://erxes.org/administrator/system-config#common-mail-config"
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
              href="https://erxes.org/administrator/system-config#custom-mail-service"
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
        </CollapseContent>

        <CollapseContent title={__('Constants')}>
          {this.renderConstant('sex_choices')}
          {this.renderConstant('company_industry_types')}
          {this.renderConstant('social_links')}
        </CollapseContent>

        <CollapseContent title={__('Connectivity Services')}>
          <ActivateInstallation />
        </CollapseContent>
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
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('General system config')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

export default GeneralSettings;
