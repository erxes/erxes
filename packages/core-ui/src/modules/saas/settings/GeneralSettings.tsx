import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
import {
  ContentBox,
  FlexRow,
  ImageWrapper,
  Title,
} from '@erxes/ui-settings/src/styles';
import {
  FILE_MIME_TYPES,
  KEY_LABELS,
  LANGUAGES,
} from '@erxes/ui-settings/src/general/constants';
import { __, readFile, uploadHandler } from 'modules/common/utils';

import Button from 'modules/common/components/Button';
import CURRENCIES from '@erxes/ui/src/constants/currencies';
import CollapseContent from 'modules/common/components/CollapseContent';
import ControlLabel from 'modules/common/components/form/Label';
import { FormControl } from 'modules/common/components/form';
import FormGroup from 'modules/common/components/form/Group';
import Header from '@erxes/ui-settings/src/general/components/Header';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import Icon from 'modules/common/components/Icon';
import Info from 'modules/common/components/Info';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React from 'react';
import Select from 'react-select-plus';
import { SelectTeamMembers } from '@erxes/ui/src';
import TwitterPicker from 'react-color/lib/Twitter';
import Wrapper from 'modules/layout/components/Wrapper';

type Props = {
  isWhiteLabel?: boolean;
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
      isSaved: false,
    };
  }

  save = (e) => {
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

  onChangeMultiCombo = (code: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map((el) => el.value);
    }

    this.onChangeConfig(code, value);
  };

  onChangeSingleCombo = (code: string, obj) => {
    this.onChangeConfig(code, obj.value);
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onLanguageChange = (language) => {
    this.setState({ language: language.value });
  };

  renderInputItem(key: string, description?: string, defaultValue?: string) {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={configsMap[key] || defaultValue}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  }

  renderItem = (key: string) => {
    const { configsMap } = this.state;

    const mimeTypeOptions = FILE_MIME_TYPES.map((item) => ({
      value: item.value,
      label: `${item.label} (${item.extension})`,
    }));
    const mimeTypeDesc =
      'Comma-separated list of media types. Leave it blank for accepting all media types';

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {mimeTypeDesc && <p>{__(mimeTypeDesc)}</p>}
        <Select
          value={configsMap[key]}
          options={mimeTypeOptions}
          onChange={this.onChangeMultiCombo.bind(this, key)}
          multi={true}
          delimiter=","
          simpleValue={true}
        />
      </FormGroup>
    );
  };

  onChangeColor = (field, e) => {
    this.onChangeConfig(field, e.hex);
  };

  renderColorPicker = (field) => {
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
      },
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
          <ImageWrapper>
            <img alt={field} src={readFile(value)} />
          </ImageWrapper>
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

  renderCloudflare() {
    const { configsMap } = this.state;

    return (
      <CollapseContent
        transparent={true}
        title={__('Cloudflare')}
        description={__('Cloudflare R2 Bucket, Images & Stream CDN configs')}
        beforeTitle={<Icon icon="comment-upload" />}
      >
        <FlexRow alignItems="flex-start" justifyContent="space-between">
          {this.renderItem('CLOUDFLARE_ACCOUNT_ID')}
          {this.renderItem('CLOUDFLARE_API_TOKEN')}
        </FlexRow>
        <FlexRow alignItems="flex-start" justifyContent="space-between">
          {this.renderItem('CLOUDFLARE_ACCESS_KEY_ID')}
          {this.renderItem('CLOUDFLARE_SECRET_ACCESS_KEY')}
        </FlexRow>
        <FlexRow alignItems="flex-start" justifyContent="space-between">
          {this.renderItem('CLOUDFLARE_BUCKET_NAME')}
          {this.renderItem('CLOUDFLARE_ACCOUNT_HASH')}
        </FlexRow>
        <FormGroup>
          <ControlLabel>{KEY_LABELS.CLOUDFLARE_USE_CDN}</ControlLabel>
          <p>{__('Upload images/videos to Cloudflare cdn')}</p>
          <FormControl
            componentClass={'checkbox'}
            checked={configsMap.CLOUDFLARE_USE_CDN}
            onChange={(e: any) => {
              this.onChangeConfig('CLOUDFLARE_USE_CDN', e.target.checked);
            }}
          />
        </FormGroup>
      </CollapseContent>
    );
  }

  render() {
    const { configsMap, language } = this.state;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General system config') },
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

    const content = (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent
          transparent={true}
          title={__('General settings')}
          beforeTitle={<Icon icon="settings" />}
        >
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
            <ControlLabel>{__('with team member restrictions')}</ControlLabel>
            <FormControl
              componentClass="checkbox"
              checked={configsMap.CHECK_TEAM_MEMBER_SHOWN}
              onChange={(e) =>
                this.onChangeConfig(
                  'CHECK_TEAM_MEMBER_SHOWN',
                  (e.target as any).checked,
                )
              }
            />
          </FormGroup>

          {configsMap.CHECK_TEAM_MEMBER_SHOWN && (
            <>
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
            </>
          )}
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__('File upload')}
          beforeTitle={<Icon icon="file-upload-alt" />}
        >
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/conversations"
              rel="noopener noreferrer"
            >
              {__('Learn how to set file uploading') + '.'}
            </a>
          </Info>
          {this.renderItem('UPLOAD_FILE_TYPES')}
          {this.renderItem('WIDGETS_UPLOAD_FILE_TYPES')}
          {this.renderItem('UPLOAD_SERVICE_TYPE')}
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__('Constants')}
          beforeTitle={<Icon icon="link-1" />}
        >
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
            title={__('System Configuration')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <Header
            title="System configuration"
            description={
              __(
                'Set up your initial account settings so that things run smoothly in unison',
              ) + '.'
            }
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('System Configuration')}</Title>}
            right={actionButtons}
          />
        }
        content={content}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;
