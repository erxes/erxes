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
import React from 'react';
import Select from 'react-select-plus';
import { ContentBox } from '../../styles';
import {
  FILE_MIME_TYPES,
  FILE_SYSTEM_TYPES,
  KEY_LABELS,
  LANGUAGES,
  MEASUREMENTS,
  SERVICE_TYPES
} from '../constants';
import { IConfigsMap } from '../types';
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
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
      language: props.currentLanguage
    };
  }

  save = e => {
    e.preventDefault();

    const { configsMap, language } = this.state;

    this.props.save(configsMap);

    this.props.changeLanguage(language);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
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
    const mimeTypeDesc =
      'Comma-separated list of media types. Leave it blank for accepting all media types';

    const content = (
      <ContentBox>
        <CollapseContent title={__('General settings')}>
          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <Select
              options={LANGUAGES}
              value={language}
              onChange={this.onLanguageChange}
              searchable={false}
              clearable={false}
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
              href="https://docs.erxes.io/administrator/system-config#file-upload"
              rel="noopener noreferrer"
            >
              {__('Learn how to set file uploading.')}
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
              href="https://docs.erxes.io/administrator/system-config#google-cloud-storage"
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
              href="https://docs.erxes.io/administrator/system-config#aws-s3"
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
            'Used when using s3 compatible service'
          )}
          {this.renderItem('AWS_FORCE_PATH_STYLE')}
        </CollapseContent>

        <CollapseContent title="AWS SES">
          <Info>
            <p>
              {__(
                'In this field, the AWS SES configuration is dedicated to providing transaction emails.'
              )}
            </p>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#aws-ses"
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
              href="https://docs.erxes.io/administrator/system-config#google"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Google variables')}
            </a>
          </Info>
          {this.renderItem('GOOGLE_PROJECT_ID')}
          {this.renderItem('GOOGLE_APPLICATION_CREDENTIALS')}
          {this.renderItem('GOOGLE_APPLICATION_CREDENTIALS_JSON')}
          {this.renderItem('GOOGLE_CLIENT_ID')}
          {this.renderItem('GOOGLE_CLIENT_SECRET')}
        </CollapseContent>

        <CollapseContent title={__('Common mail config')}>
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#common-mail-config"
              rel="noopener noreferrer"
            >
              {__('Learn more about Email Settings')}
            </a>
          </Info>

          {this.renderItem('COMPANY_EMAIL_FROM')}
          {this.renderItem(
            'DEFAULT_EMAIL_SERVICE',
            'Write your default email service name. Default email service is SES'
          )}
        </CollapseContent>

        <CollapseContent title={__('Custom mail service')}>
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#custom-mail-service"
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

        <CollapseContent title={__('Constants')}>
          {this.renderConstant('sex_choices')}
          {this.renderConstant('company_industry_types')}
          {this.renderConstant('social_links')}
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
