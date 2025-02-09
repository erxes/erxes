import { ColorPick, ColorPicker } from "@erxes/ui/src/styles/main";
import {
  ContentBox,
  FlexRow,
  ImageWrapper,
  Title
} from "@erxes/ui-settings/src/styles";
import {
  FILE_MIME_TYPES,
  KEY_LABELS,
  LANGUAGES
} from "@erxes/ui-settings/src/general/constants";
import { __, readFile, uploadHandler } from "modules/common/utils";

import Button from "modules/common/components/Button";
import CURRENCIES from "@erxes/ui/src/constants/currencies";
import CollapseContent from "modules/common/components/CollapseContent";
import ControlLabel from "modules/common/components/form/Label";
import { FormControl } from "modules/common/components/form";
import FormGroup from "modules/common/components/form/Group";
import Header from "@erxes/ui-settings/src/general/components/Header";
import { IConfigsMap } from "@erxes/ui-settings/src/general/types";
import Icon from "modules/common/components/Icon";
import Info from "modules/common/components/Info";
import Popover from "@erxes/ui/src/components/Popover";
import React from "react";
import Select from "react-select";
import { SelectTeamMembers } from "@erxes/ui/src";
import TwitterPicker from "react-color/lib/Twitter";
import Wrapper from "modules/layout/components/Wrapper";

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

    const mimeTypeOptions = FILE_MIME_TYPES.map(item => ({
      value: item.value,
      label: `${item.label} (${item.extension})`
    }));
    const mimeTypeDesc =
      "Comma-separated list of media types. Leave it blank for accepting all media types";

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {mimeTypeDesc && <p>{__(mimeTypeDesc)}</p>}
        <Select
          value={mimeTypeOptions.filter(o =>
            (configsMap.WIDGETS_UPLOAD_FILE_TYPES || []).includes(o.value)
          )}
          options={mimeTypeOptions}
          onChange={this.onChangeMultiCombo.bind(this, key)}
          isMulti={true}
          delimiter=","
          // simpleValue={true}
        />
      </FormGroup>
    );
  };

  renderItemInput = (
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
        placement="bottom-start"
        trigger={
          <ColorPick>
            <ColorPicker style={{ backgroundColor: value }} />
          </ColorPick>
        }
      >
        <TwitterPicker
          color={value}
          onChange={this.onChangeColor.bind(this, field)}
          triangle="hide"
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
      value = defaultValues[kind] || "";
    }

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[kind]}</ControlLabel>

        <Select
          options={constant}
          value={value}
          onChange={this.onChangeMultiCombo.bind(this, kind)}
          isMulti={true}
        />
      </FormGroup>
    );
  }

  render() {
    const { configsMap, language } = this.state;

    const breadcrumb = [
      { title: __("Settings"), link: "/settings" },
      { title: __("General system config") }
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
              value={{ value: language, label: language }}
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
              value={CURRENCIES.filter(o =>
                configsMap.dealCurrency?.includes(o.value)
              )}
              onChange={this.onChangeMultiCombo.bind(this, "dealCurrency")}
              isMulti={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__("with team member restrictions")}</ControlLabel>
            <FormControl
              componentclass="checkbox"
              checked={configsMap.CHECK_TEAM_MEMBER_SHOWN}
              onChange={e =>
                this.onChangeConfig(
                  "CHECK_TEAM_MEMBER_SHOWN",
                  (e.target as any).checked
                )
              }
            />
          </FormGroup>

          {configsMap.CHECK_TEAM_MEMBER_SHOWN && (
            <>
              <FormGroup>
                <ControlLabel>
                  {__("Team members who can access every branches")}
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
                  {__("Team members who can access every departments")}
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
          title={__("File upload")}
          beforeTitle={<Icon icon="file-upload-alt" />}
        >
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/conversations"
              rel="noopener noreferrer"
            >
              {__("Learn how to set file uploading") + "."}
            </a>
          </Info>
          {this.renderItem("UPLOAD_FILE_TYPES")}
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
          title="MessagePro"
          beforeTitle={<Icon icon="comment-alt-verify" />}
        >
          <FlexRow $alignItems="flex-start" $justifyContent="space-between">
            {this.renderItemInput("MESSAGE_PRO_API_KEY")}
            {this.renderItemInput("MESSAGE_PRO_PHONE_NUMBER")}
          </FlexRow>
        </CollapseContent>
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
            title="System configuration"
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
