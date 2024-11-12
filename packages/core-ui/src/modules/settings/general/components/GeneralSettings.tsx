import { ColorPick, ColorPicker, LinkButton } from "@erxes/ui/src/styles/main";
import {
  ContentBox,
  FlexRow,
  ImageWrapper,
  Title,
} from "@erxes/ui-settings/src/styles";
import {
  DATA_RETENTION_DURATION,
  FILE_MIME_TYPES,
  FILE_SYSTEM_TYPES,
  KEY_LABELS,
  LANGUAGES,
  LOG_RETENTION_DURATION,
  SERVICE_TYPES,
} from "@erxes/ui-settings/src/general/constants";
import {
  __,
  loadDynamicComponent,
  readFile,
  uploadHandler,
} from "modules/common/utils";

import ActivateInstallation from "./ActivateInstallation";
import Button from "modules/common/components/Button";
import CURRENCIES from "@erxes/ui/src/constants/currencies";
import CollapseContent from "modules/common/components/CollapseContent";
import ControlLabel from "modules/common/components/form/Label";
import EmailConfigForm from "@erxes/ui-settings/src/general/components/EmailConfigForm";
import { FormControl } from "modules/common/components/form";
import FormGroup from "modules/common/components/form/Group";
import Header from "@erxes/ui-settings/src/general/components/Header";
import {
  IConfigsMap,
  IEmailConfig,
} from "@erxes/ui-settings/src/general/types";
import Icon from "modules/common/components/Icon";
import Info from "modules/common/components/Info";
import Popover from "@erxes/ui/src/components/Popover";
import React from "react";
import Select from "react-select";
import { SelectTeamMembers } from "@erxes/ui/src";
import TwitterPicker from "react-color/lib/Twitter";
import Wrapper from "modules/layout/components/Wrapper";
import { FlexColumn } from "@erxes/ui/src/components/step/style";

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
      isSaved: false,
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

  onChangeEmailConfig = (emailConfig: IEmailConfig) => {
    this.onChangeConfig("COMPANY_EMAIL_FROM", emailConfig.email);
    this.onChangeConfig("COMPANY_EMAIL_TEMPLATE_TYPE", emailConfig.type);
    this.onChangeConfig("COMPANY_EMAIL_TEMPLATE", emailConfig.template);
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

  onChangeGooglAdditionalJSON = (index, e) => {
    const credentials =
      this.state?.configsMap?.GOOGLE_APP_ADDITIONAL_CREDS_JSON || [];

    credentials[index] = (e.currentTarget as HTMLInputElement).value;

    this.onChangeConfig("GOOGLE_APP_ADDITIONAL_CREDS_JSON", credentials);
  };

  onRemoveGoogleAdditionalJSON = index => {
    let credentials =
      this.state?.configsMap?.GOOGLE_APP_ADDITIONAL_CREDS_JSON || [];

    credentials = credentials.filter((_, i) => i !== index);

    this.onChangeConfig("GOOGLE_APP_ADDITIONAL_CREDS_JSON", credentials);
  };

  renderItem = (
    key: string,
    description?: string,
    componentClass?: string,
    actionComponent?: React.ReactNode
  ) => {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <FlexRow $justifyContent={actionComponent ? "space-between" : ""}>
          <ControlLabel>{KEY_LABELS[key]}</ControlLabel>

          {actionComponent ? actionComponent : null}
        </FlexRow>
        {description && <p>{__(description)}</p>}
        <FormControl
          componentclass={componentClass}
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

    return (
      <Popover
        trigger={
          <ColorPick>
            <ColorPicker style={{ backgroundColor: value }} />
          </ColorPick>
        }
        placement='bottom-start'
      >
        <TwitterPicker
          color={value}
          onChange={this.onChangeColor.bind(this, field)}
          triangle='hide'
        />
      </Popover>
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
        <input type='file' onChange={this.handleLogoChange.bind(this, field)} />
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
      value = defaultValues[kind] || "";
    }


    const optionValue = value?.every((i) => typeof i === "string")
      ? constant.filter((o) => value.includes(o.value))
      : value;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[kind]}</ControlLabel>

        <Select
          options={constant}
          value={optionValue}
          onChange={this.onChangeMultiCombo.bind(this, kind)}
          isMulti={true}
        />
      </FormGroup>
    );
  }

  renderCloudflare() {
    const { configsMap } = this.state;

    const handleChange = (e: React.FormEvent<HTMLElement>) => {
      const event = e as React.ChangeEvent<HTMLInputElement>;
      this.onChangeConfig("CLOUDFLARE_USE_CDN", event.target.checked);
    };

    return (
      <CollapseContent
        transparent={true}
        title={__("Cloudflare")}
        description={__("Cloudflare R2 Bucket, Images & Stream CDN configs")}
        beforeTitle={<Icon icon="comment-upload" />}
      >
        <FlexRow $alignItems="flex-start" $justifyContent="space-between">
          {this.renderItem("CLOUDFLARE_ACCOUNT_ID")}
          {this.renderItem("CLOUDFLARE_API_TOKEN")}
        </FlexRow>
        <FlexRow $alignItems="flex-start" $justifyContent="space-between">
          {this.renderItem("CLOUDFLARE_ACCESS_KEY_ID")}
          {this.renderItem("CLOUDFLARE_SECRET_ACCESS_KEY")}
        </FlexRow>
        <FlexRow $alignItems="flex-start" $justifyContent="space-between">
          {this.renderItem("CLOUDFLARE_BUCKET_NAME")}
          {this.renderItem("CLOUDFLARE_ACCOUNT_HASH")}
        </FlexRow>
        <FormGroup>
          <ControlLabel>{KEY_LABELS.CLOUDFLARE_USE_CDN}</ControlLabel>
          <p>{__("Upload images/videos to Cloudflare cdn")}</p>
          <FormControl
            componentclass={"checkbox"}
            checked={configsMap.CLOUDFLARE_USE_CDN}
            onChange={handleChange}
          />
        </FormGroup>
      </CollapseContent>
    );
  }

  render() {
    const { configsMap, language } = this.state;

    const breadcrumb = [
      { title: __("Settings"), link: "/settings" },
      { title: __("General system config") },
    ];

    const actionButtons = (
      <Button
        id='generalSettingsSave'
        btnStyle='success'
        onClick={this.save}
        icon='check-circle'
      >
        Save
      </Button>
    );

    const mimeTypeOptions = FILE_MIME_TYPES.map(item => ({
      value: item.value,
      label: `${item.label} (${item.extension})`,
    }));
    const mimeTypeDesc = __(
      "Comma-separated list of media types. Leave it blank for accepting all media types"
    );

    const emailServiceOptions = [
      { label: "SES", value: "SES" },
      { label: "Custom", value: "custom" },
    ];

    const handleChange = (e: React.FormEvent<HTMLElement>) => {
      const event = e as React.ChangeEvent<HTMLInputElement>;
      this.onChangeConfig("CHECK_TEAM_MEMBER_SHOWN", event.target.checked);
    };

    const content = (
      <ContentBox id={"GeneralSettingsMenu"}>
        <CollapseContent
          transparent={true}
          title={__("General settings")}
          beforeTitle={<Icon icon="settings" />}
        >
          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <Select
              options={LANGUAGES}
              value={LANGUAGES.find(o => o.value === language)}
              onChange={this.onLanguageChange}
              isSearchable={false}
              isClearable={false}
              placeholder={__("Select")}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Currency</ControlLabel>
            <Select
              options={CURRENCIES}
              value={CURRENCIES.filter((o) =>
                configsMap.dealCurrency?.includes(o.value)
              )}
              onChange={this.onChangeMultiCombo.bind(this, "dealCurrency")}
              isMulti={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__("with team member restrictions")}</ControlLabel>
            <FormControl
              componentclass='checkbox'
              checked={configsMap.CHECK_TEAM_MEMBER_SHOWN}
              onChange={handleChange}
            />
          </FormGroup>

          {configsMap.CHECK_TEAM_MEMBER_SHOWN && (
            <>
              <FormGroup>
                <ControlLabel>
                  {__("Team members who can access every branches")}
                </ControlLabel>
                <SelectTeamMembers
                  name='BRANCHES_MASTER_TEAM_MEMBERS_IDS'
                  initialValue={configsMap.BRANCHES_MASTER_TEAM_MEMBERS_IDS}
                  label='Select team members'
                  onSelect={(values, name) => this.onChangeConfig(name, values)}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>
                  {__("Team members who can access every departments")}
                </ControlLabel>
                <SelectTeamMembers
                  name='DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS'
                  label='Select team members'
                  initialValue={configsMap.DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS}
                  onSelect={(values, name) => this.onChangeConfig(name, values)}
                />
              </FormGroup>
            </>
          )}
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("Theme")}
          beforeTitle={<Icon icon="puzzle" />}
        >
          <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
            {this.renderUploadImage(
              "THEME_LOGO",
              "Transparent PNG, around 3:1 aspect ratio. Max width: 600px."
            )}
            {this.renderUploadImage(
              "THEME_FAVICON",
              "16x16px transparent PNG."
            )}
            <FormGroup>
              <ControlLabel>{__("Text color")}</ControlLabel>
              <p>{__("Used on the login page text")}</p>
              {this.renderColorPicker("THEME_TEXT_COLOR")}
            </FormGroup>

            <FormGroup>
              <ControlLabel>{__("Background")}</ControlLabel>
              <p>{__("Used on the login background")}</p>
              {this.renderColorPicker("THEME_BACKGROUND")}
            </FormGroup>
          </FlexRow>
          {this.renderItem("THEME_MOTTO", "", "textarea")}

          {this.renderItem("THEME_LOGIN_PAGE_DESCRIPTION", "", "textarea")}
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("File upload")}
          beforeTitle={<Icon icon="file-upload-alt" />}
        >
          <Info>
            <a
              target='_blank'
              href='https://docs.erxes.io/conversations'
              rel='noopener noreferrer'
            >
              {__("Learn how to set file uploading") + "."}
            </a>
          </Info>
          <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
            <FormGroup>
              <ControlLabel>{KEY_LABELS.UPLOAD_FILE_TYPES}</ControlLabel>
              {mimeTypeDesc && <p>{__(mimeTypeDesc)}</p>}
              <Select
                value={mimeTypeOptions.filter((o) =>
                  (configsMap.UPLOAD_FILE_TYPES || []).includes(o.value)
                )}
                options={mimeTypeOptions}
                onChange={this.onChangeMultiCombo.bind(
                  this,
                  "UPLOAD_FILE_TYPES"
                )}
                isMulti={true}
                delimiter=','
                // simpleValue={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>
                {KEY_LABELS.WIDGETS_UPLOAD_FILE_TYPES}
              </ControlLabel>
              {mimeTypeDesc && <p>{__(mimeTypeDesc)}</p>}
              <Select
                value={mimeTypeOptions.filter((o) =>
                  (configsMap.WIDGETS_UPLOAD_FILE_TYPES || []).includes(o.value)
                )}
                options={mimeTypeOptions}
                onChange={this.onChangeMultiCombo.bind(
                  this,
                  "WIDGETS_UPLOAD_FILE_TYPES"
                )}
                isMulti={true}
                delimiter=','
                // simpleValue={true}
              />
            </FormGroup>
          </FlexRow>
          <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
            <FormGroup>
              <ControlLabel>{KEY_LABELS.UPLOAD_SERVICE_TYPE}</ControlLabel>
              <Select
                options={SERVICE_TYPES}
                value={SERVICE_TYPES.find(
                  (o) => (configsMap.UPLOAD_SERVICE_TYPE || "AWS") === o.value
                )}
                isClearable={false}
                onChange={this.onChangeSingleCombo.bind(
                  this,
                  "UPLOAD_SERVICE_TYPE"
                )}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{KEY_LABELS.FILE_SYSTEM_PUBLIC}</ControlLabel>
              <Select
                options={FILE_SYSTEM_TYPES}
                value={FILE_SYSTEM_TYPES.find(
                  (o) => o.value === (configsMap.FILE_SYSTEM_PUBLIC || "true")
                )}
                isClearable={false}
                isSearchable={false}
                onChange={this.onChangeSingleCombo.bind(
                  this,
                  "FILE_SYSTEM_PUBLIC"
                )}
              />
            </FormGroup>
          </FlexRow>
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("Google Cloud Storage")}
          beforeTitle={<Icon icon="cloud-1" />}
        >
          <Info>
            <a
              target='_blank'
              href='https://docs.erxes.io/conversations'
              rel='noopener noreferrer'
            >
              {__(
                "Learn how to create or find your Google Cloud Storage bucket"
              )}
            </a>
          </Info>
          <FormGroup>
            <ControlLabel>Google Bucket Name</ControlLabel>
            {this.renderItem("GOOGLE_CLOUD_STORAGE_BUCKET")}
          </FormGroup>
        </CollapseContent>

        {this.renderCloudflare()}

        <CollapseContent
          transparent={true}
          title='AWS S3'
          beforeTitle={<Icon icon='server-network' />}
        >
          <Info>
            <a
              target='_blank'
              href='https://docs.erxes.io/conversations'
              rel='noopener noreferrer'
            >
              {__("Learn how to set AWS S3 Variables")}
            </a>
          </Info>
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItem("AWS_ACCESS_KEY_ID")}
            {this.renderItem("AWS_SECRET_ACCESS_KEY")}
          </FlexRow>
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItem("AWS_BUCKET")}
            {this.renderItem("AWS_PREFIX")}
          </FlexRow>
          {this.renderItem(
            "AWS_COMPATIBLE_SERVICE_ENDPOINT",
            __("Used when using s3 compatible service")
          )}
          {this.renderItem("AWS_FORCE_PATH_STYLE")}
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title='AWS SES'
          beforeTitle={<Icon icon='shield-check' />}
        >
          <Info>
            <p>
              {__(
                "In this field, the AWS SES configuration is dedicated to providing transaction emails"
              ) + "."}
            </p>
            <a
              target='_blank'
              href='https://docs.erxes.io/conversations'
              rel='noopener noreferrer'
            >
              {__("Learn how to set Amazon SES variables")}
            </a>
          </Info>
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItem("AWS_SES_ACCESS_KEY_ID")}
            {this.renderItem("AWS_SES_SECRET_ACCESS_KEY")}
          </FlexRow>
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItem("AWS_REGION")}
            {this.renderItem("AWS_SES_CONFIG_SET")}
          </FlexRow>
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("Azure Blob Storage")}
          beforeTitle={<Icon icon="cloud-check" />}
        >
          <FormGroup>
            <ControlLabel>Container Name</ControlLabel>
            {this.renderItem("AZURE_STORAGE_CONTAINER")}
          </FormGroup>
          <FormGroup>
            <ControlLabel>Connection String</ControlLabel>
            {this.renderItem("AZURE_STORAGE_CONNECTION_STRING")}
          </FormGroup>
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title='Google'
          beforeTitle={<Icon icon='google' />}
        >
          <Info>
            <a
              target='_blank'
              href='https://docs.erxes.io/conversations'
              rel='noopener noreferrer'
            >
              {__("Learn how to set Google variables")}
            </a>
          </Info>
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItem("GOOGLE_PROJECT_ID")}
            {this.renderItem("GOOGLE_CLIENT_ID")}
          </FlexRow>
          <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
            {this.renderItem(
              "GOOGLE_CLIENT_SECRET",
              "Client Secret key are required for authentication and authorization purposes"
            )}
            {this.renderItem(
              "GOOGLE_GMAIL_TOPIC",
              "The topic value created in Gmail setup"
            )}
          </FlexRow>
          <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
            <FlexColumn>
              {this.renderItem(
                "GOOGLE_APPLICATION_CREDENTIALS_JSON",
                "Firebase config for notifications",
                undefined,
                configsMap?.GOOGLE_APPLICATION_CREDENTIALS_JSON ? (
                  <LinkButton
                    onClick={() =>
                      this.onChangeConfig("GOOGLE_APP_ADDITIONAL_CREDS_JSON", [
                        ...(configsMap?.GOOGLE_APP_ADDITIONAL_CREDS_JSON || []),
                        "",
                      ])
                    }
                  >
                    {__("+ Add additional JSON config")}
                  </LinkButton>
                ) : undefined
              )}
              {(configsMap?.GOOGLE_APP_ADDITIONAL_CREDS_JSON || []).map(
                (additionalJSON, index) => (
                  <FlexRow key={index}>
                    <FormControl
                      value={additionalJSON}
                      onChange={this.onChangeGooglAdditionalJSON.bind(
                        this,
                        index
                      )}
                    />
                    <Button
                      btnStyle='danger'
                      icon='times'
                      onClick={this.onRemoveGoogleAdditionalJSON.bind(
                        this,
                        index
                      )}
                    />
                  </FlexRow>
                )
              )}
            </FlexColumn>
            {this.renderItem("GOOGLE_MAP_API_KEY", "Google Map Api Key")}
          </FlexRow>
          <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
            {this.renderItem(
              'GOOGLE_APPLICATION_CREDENTIALS',
              'Google service account`s key path'
            )}
          </FlexRow>
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("Common mail config")}
          beforeTitle={<Icon icon="envelopes" />}
        >
          <Info>
            <a
              target='_blank'
              href='https://docs.erxes.io/conversations'
              rel='noopener noreferrer'
            >
              {__("Learn more about Email Settings")}
            </a>
          </Info>

          <EmailConfigForm
            emailConfig={{
              email: configsMap.COMPANY_EMAIL_FROM,
              type: configsMap.COMPANY_EMAIL_TEMPLATE_TYPE,
              template: configsMap.COMPANY_EMAIL_TEMPLATE,
            }}
            emailText='Set an email address you wish to send your internal transactional emails from. For example, task notifications, team member mentions, etc.'
            setEmailConfig={this.onChangeEmailConfig}
            isSaved={this.state.isSaved}
          />
          <FormGroup>
            <ControlLabel>DEFAULT EMAIL SERVICE</ControlLabel>
            <p>
              {__(
                "Choose your email service name. The default email service is SES."
              )}
            </p>
            <Select
              options={emailServiceOptions}
              value={emailServiceOptions.find(
                (o) => o.value === (configsMap.DEFAULT_EMAIL_SERVICE || "SES")
              )}
              isClearable={false}
              isSearchable={false}
              onChange={this.onChangeSingleCombo.bind(
                this,
                "DEFAULT_EMAIL_SERVICE"
              )}
            />
          </FormGroup>
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("Custom mail service")}
          beforeTitle={<Icon icon="server-alt" />}
        >
          <Info>
            <a
              target='_blank'
              href='https://docs.erxes.io/conversations'
              rel='noopener noreferrer'
            >
              {__("Learn the case of custom email service")}
            </a>
          </Info>
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItem("MAIL_SERVICE")}
            {this.renderItem("MAIL_PORT")}
          </FlexRow>
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItem("MAIL_USER")}
            {this.renderItem("MAIL_PASS")}
          </FlexRow>
          {this.renderItem("MAIL_HOST")}
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("Data retention")}
          beforeTitle={<Icon icon="cloud-data-connection" />}
        >
          <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
            <FormGroup>
              <ControlLabel>
                {KEY_LABELS.NOTIFICATION_DATA_RETENTION}
              </ControlLabel>
              <Select
                options={DATA_RETENTION_DURATION}
                value={DATA_RETENTION_DURATION.find(
                  (o) =>
                    o.value === (configsMap.NOTIFICATION_DATA_RETENTION || 3)
                )}
                isClearable={false}
                isSearchable={false}
                onChange={this.onChangeSingleCombo.bind(
                  this,
                  "NOTIFICATION_DATA_RETENTION"
                )}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{KEY_LABELS.LOG_DATA_RETENTION}</ControlLabel>
              <Select
                options={LOG_RETENTION_DURATION}
                value={LOG_RETENTION_DURATION.find(
                  (o) => o.value === (configsMap.LOG_DATA_RETENTION || 1)
                )}
                isClearable={false}
                isSearchable={false}
                onChange={this.onChangeSingleCombo.bind(
                  this,
                  "LOG_DATA_RETENTION"
                )}
              />
            </FormGroup>
          </FlexRow>
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("Constants")}
          beforeTitle={<Icon icon="link-1" />}
        >
          {this.renderConstant("sex_choices")}
          {this.renderConstant("company_industry_types")}
          {this.renderConstant("social_links")}
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title={__("Connectivity Services")}
          beforeTitle={<Icon icon="share-alt" />}
        >
          <ActivateInstallation />
        </CollapseContent>

        <CollapseContent
          transparent={true}
          title='MessagePro'
          beforeTitle={<Icon icon='comment-alt-verify' />}
        >
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItem("MESSAGE_PRO_API_KEY")}
            {this.renderItem("MESSAGE_PRO_PHONE_NUMBER")}
          </FlexRow>
        </CollapseContent>

        {loadDynamicComponent(
          "extendSystemConfig",
          { ...this.props, onChangeConfig: this.onChangeConfig },
          true
        )}
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__("System Configuration")}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <Header
            title='System configuration'
            description={
              __(
                "Set up your initial account settings so that things run smoothly in unison"
              ) + "."
            }
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__("System Configuration")}</Title>}
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
