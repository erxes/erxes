import {
  ClearButton,
  ColorPickerWrapper,
  Domain,
  FlexRow,
  StatusBox,
  StatusTitle,
  UpgradeButtons,
  Alert,
} from "../styles";
import { ColorPick, ColorPicker } from "@erxes/ui/src/styles/main";
import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";

import AvatarUpload from "@erxes/ui/src/components/AvatarUpload";
import Button from "@erxes/ui/src/components/Button";
import { COLORS } from "@erxes/ui/src/constants/colors";
import EmailConfigForm from "@erxes/ui-settings/src/general/components/EmailConfigForm";
import { IConfigsMap } from "@erxes/ui-settings/src/general/types";
import { IOrganization } from "../types";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import React from "react";
import Table from "@erxes/ui/src/components/table";
import Tip from "@erxes/ui/src/components/Tip";
import TwitterPicker from "react-color/lib/Twitter";
import { __ } from "@erxes/ui/src/utils";
import { colors } from "@erxes/ui/src/styles";

type Props = {
  currentOrganization: IOrganization;
  editDomain: ({ type, domain }: { type: string; domain: string }) => void;
  save: (
    {
      icon,
      link,
      name,
      iconColor,
      textColor,
      logo,
      favicon,
      backgroundColor,
      description,
      map,
    }: {
      icon: string;
      logo?: string;
      link: string;
      name: string;
      favicon?: string;
      iconColor?: string;
      textColor?: string;
      backgroundColor?: string;
      description?: string;
      map?: IConfigsMap;
    },
    callback?: () => void
  ) => void;
  configsMap: IConfigsMap;
};

type State = {
  name: string;
  description?: string;
  iconColor?: string;
  dnsStatus?: string;
  domain: string;
  logo?: string;
  favicon?: string;
  subdomain: string;
  backgroundColor?: string;
  textColor?: string;
  icon: string;
  configsMap: IConfigsMap;
  isSaved: boolean;
};

class OrganizationProfile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      icon = "",
      subdomain,
      name,
      description,
      iconColor = colors.colorWhite,
      textColor = colors.colorWhite,
      logo,
      dnsStatus,
      favicon = "",
      domain,
      backgroundColor = colors.colorPrimaryDark,
    } = props.currentOrganization;

    this.state = {
      configsMap: props.configsMap,
      icon,
      subdomain,
      name,
      favicon,
      dnsStatus,
      domain: domain || "",
      logo: logo || "/images/logo.png",
      iconColor,
      textColor,
      description,
      backgroundColor,
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentOrganization !== prevProps.currentOrganization) {
      const {
        icon = "",
        subdomain,
        name,
        logo = "",
        iconColor,
        description,
        textColor = colors.colorWhite,
        backgroundColor = colors.colorPrimaryDark,
      } = this.props.currentOrganization;

      this.setState({
        icon,
        logo,
        subdomain,
        name,
        iconColor,
        textColor,
        description,
        backgroundColor,
      });
    }
  }

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeEmailConfig = (emailConfig: any) => {
    this.onChangeConfig("COMPANY_EMAIL_FROM", emailConfig.email);
    this.onChangeConfig("COMPANY_EMAIL_TEMPLATE_TYPE", emailConfig.type);
    this.onChangeConfig("COMPANY_EMAIL_TEMPLATE", emailConfig.template);
  };

  clearBackground = () => {
    this.setState({ backgroundColor: undefined });
  };

  onChangeInput = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as any);
  };

  onUpload = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as any);
  };

  onBackgroundColorChange = (e) => {
    this.setState({ backgroundColor: e.hex });
  };

  onIconColorChange = (e) => {
    this.setState({ iconColor: e.hex });
  };

  onTextColorChange = (e) => {
    this.setState({ textColor: e.hex });
  };

  save = () => {
    const { save } = this.props;
    const {
      icon,
      subdomain,
      name,
      backgroundColor,
      description,
      iconColor,
      textColor,
      favicon,
      logo,
      configsMap,
    } = this.state;

    save({
      favicon,
      icon,
      link: subdomain,
      name,
      backgroundColor,
      description,
      iconColor,
      textColor,
      logo,
      map: configsMap,
    });

    this.setState({ isSaved: true });
  };

  renderSaveButton() {
    return (
      <Button btnStyle="success" uppercase={false} onClick={this.save}>
        Save Organization Detail
      </Button>
    );
  }

  editDomain = (type: string) => {
    const { editDomain } = this.props;
    const { domain } = this.state;

    editDomain({
      type,
      domain,
    });

    this.setState({ isSaved: true });
  };

  renderFavicon = () => {
    const { favicon } = this.state;

    const handleAvatarUploader = (url) => this.onUpload("favicon", url);

    return (
      <FormGroup>
        <ControlLabel>Favicon</ControlLabel>
        <p>16x16px transparent PNG.</p>
        <AvatarUpload
          avatar={favicon}
          onAvatarUpload={handleAvatarUploader}
          title="favicon"
          extraFormData={[{ key: "isPublic", value: "true" }]}
          defaultAvatar={favicon}
          square={true}
        />
      </FormGroup>
    );
  };

  renderMainLogo = () => {
    const { logo } = this.state;

    const handleAvatarUploader = (url) => this.onUpload("logo", url);

    return (
      <FormGroup>
        <ControlLabel>Login page Logo</ControlLabel>
        <p>Transparent PNG, around 3:1 aspect ratio. Max width: 600px.</p>
        <AvatarUpload
          avatar={logo}
          onAvatarUpload={handleAvatarUploader}
          title="logo"
          extraFormData={[{ key: "isPublic", value: "true" }]}
          defaultAvatar={logo}
          square={true}
          width={300}
          backgroundColor={colors.bgMain}
        />
      </FormGroup>
    );
  };

  renderEmailFields() {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <EmailConfigForm
          emailConfig={{
            email: configsMap.COMPANY_EMAIL_FROM,
            type: configsMap.COMPANY_EMAIL_TEMPLATE_TYPE,
            template: configsMap.COMPANY_EMAIL_TEMPLATE,
          }}
          emailText="Set an email address you wish to send your internal transactional emails from. For example, task notifications, team member mentions, etc."
          setEmailConfig={this.onChangeEmailConfig}
          isSaved={this.state.isSaved}
        />
      </FormGroup>
    );
  }

  renderColors() {
    const { textColor, iconColor, backgroundColor } = this.state;

    const colorPopover = (color, onChange, id: string) => {
      return (
        <TwitterPicker
          width="266px"
          triangle="hide"
          color={{ hex: color }}
          onChange={onChange}
          colors={COLORS}
        />
      );
    };

    const textPopover = colorPopover(
      textColor,
      this.onTextColorChange,
      "text-popover"
    );
    const backgroundPopover = colorPopover(
      backgroundColor,
      this.onBackgroundColorChange,
      "background-popover"
    );

    const iconPopover = colorPopover(
      iconColor,
      this.onIconColorChange,
      "icon-color-popover"
    );

    return (
      <>
        <FormGroup>
          <ControlLabel>Text color</ControlLabel>
          <p>Used on the login page text</p>
          <ColorPickerWrapper>
            <Popover
              placement="bottom"
              trigger={
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: textColor }} />
                </ColorPick>
              }
            >
              {textPopover}
            </Popover>
          </ColorPickerWrapper>
        </FormGroup>

        <div className="hide">
          <FormGroup>
            <ControlLabel>Icon color</ControlLabel>
            <Popover
              placement="bottom"
              trigger={
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: iconColor }} />
                </ColorPick>
              }
            >
              {iconPopover}
            </Popover>
          </FormGroup>
        </div>

        <FormGroup>
          <ControlLabel>Background</ControlLabel>
          <Tip text={__("Clear background")} placement="top">
            <ClearButton>
              <Icon icon="history" onClick={this.clearBackground} />
            </ClearButton>
          </Tip>
          <p>Used on the login background</p>
          <ColorPickerWrapper>
            <Popover
              placement="bottom"
              trigger={
                <ColorPick>
                  <ColorPicker style={{ backgroundColor }} />
                </ColorPick>
              }
            >
              {backgroundPopover}
            </Popover>
          </ColorPickerWrapper>
        </FormGroup>
      </>
    );
  }

  renderLoginPage() {
    const { description } = this.state;
    const descriptionOnChange = (e) =>
      this.onChangeInput("description", (e.target as HTMLInputElement).value);

    return (
      <>
        <FormGroup>
          <ControlLabel>Login Page Description</ControlLabel>
          <FormControl
            value={description || ""}
            type="text"
            componentclass="textarea"
            onChange={descriptionOnChange}
            required={false}
          />
        </FormGroup>
      </>
    );
  }

  renderDNS() {
    const { subdomain, dnsStatus, domain } = this.state;

    const { currentOrganization } = this.props;

    const customDomainStatus = currentOrganization.customDomainStatus || {};

    const ownershipVerification =
      customDomainStatus.ownership_verification || {};
    const sslVerification = customDomainStatus.ssl || {};

    const { sslStatus, hostNameStatus } = currentOrganization;

    const domainOnChange = (e) =>
      this.onChangeInput("domain", (e.target as HTMLInputElement).value);

    return (
      <StatusBox>
        <StatusTitle>{__("Custom Domain")}</StatusTitle>
        <FlexRow>
          <FormGroup>
            <ControlLabel>Custom domain</ControlLabel>
            <Domain>
              <FormControl
                name="domain"
                value={domain}
                type="text"
                componentclass="text"
                onChange={domainOnChange}
              />
            </Domain>
          </FormGroup>
          <FormGroup>
            <ControlLabel>DNS Record</ControlLabel>
            <Alert>
              <div>
                Add the records below to your DNS settings for {subdomain}
                .app.erxes.io
              </div>
              <p>
                You need to add both records below. The second record will only
                be available once the first has been set and its status is
                ACTIVE. Please allow up to 24 hours for that to happen, unless
                you can force a DNS refresh with your hosting provider. If you
                are using Cloudflare, make sure you set the records to "DNS
                only" (grey cloud). Unsure of how to change DNS records for your
                domain? Get in touch and we can talk you through it. For
                provider-specific information, please refer to{" "}
                <a
                  rel="noopener noreferrer"
                  href="https://help.erxes.io/help/knowledge-base/article/detail?catId=ogZPWFSy78Anc5Ras&_id=dfggSKv8ZCKdkwK26"
                  target="_blank"
                >
                  this guide
                </a>
                .
              </p>
            </Alert>
          </FormGroup>
        </FlexRow>
        {this.props.currentOrganization.domain ? (
          <FormGroup>
            <Table $striped={true} $condensed={true} $bordered={true}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CNAME</td>
                  <td>{domain || "Your domain"}</td>
                  <td>{subdomain}.app.erxes.io</td>
                  <td>
                    <b>{(dnsStatus || "Undefined").toUpperCase()}</b>
                  </td>
                </tr>
                <tr>
                  <td>Certificate validation TXT</td>
                  <td>{sslVerification.txt_name}</td>
                  <td>{sslVerification.txt_value}</td>
                  <td>
                    <b>{(sslStatus || "Undefined").toUpperCase()}</b>
                  </td>
                </tr>
                <tr>
                  <td>Hostname pre-validation TXT</td>
                  <td>{ownershipVerification.name}</td>
                  <td>{ownershipVerification.value}</td>
                  <td>
                    <b>{(hostNameStatus || "Undefined").toUpperCase()}</b>
                  </td>
                </tr>
              </tbody>
            </Table>
          </FormGroup>
        ) : null}
        {this.props.currentOrganization.domain ? (
          <>
            <Button
              btnStyle="default"
              uppercase={false}
              onClick={() => this.editDomain("refresh")}
            >
              Refresh
            </Button>
            <Button
              btnStyle="danger"
              uppercase={false}
              onClick={() => this.editDomain("reset")}
            >
              Reset Domain
            </Button>
          </>
        ) : (
          <Button
            btnStyle="success"
            uppercase={false}
            onClick={() => this.editDomain("save")}
          >
            Save
          </Button>
        )}
      </StatusBox>
    );
  }

  render() {
    const { subdomain, name, icon } = this.state;
    const avatar = icon || "/images/erxes.png";
    const isWhiteLabel = localStorage.getItem("organizationInfo") !== null;

    const nameOnChange = (e) =>
      this.onChangeInput("name", (e.target as HTMLInputElement).value);
    const subdomainOnChange = (e) =>
      this.onChangeInput("subdomain", (e.target as HTMLInputElement).value);
    const handleAvatarUploader = (url) => this.onUpload("icon", url);

    return (
      <StatusBox largePadding={true} largeMargin={true}>
        <StatusTitle>{__("Organization Profile")}</StatusTitle>
        <FlexRow>
          <FormGroup>
            <FormGroup>
              <ControlLabel>Organization Name</ControlLabel>

              <FormControl
                value={name}
                type="text"
                onChange={nameOnChange}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Organization URL</ControlLabel>
              <Domain>
                <FormControl
                  name="subdomain"
                  value={subdomain}
                  type="text"
                  onChange={subdomainOnChange}
                  required={true}
                />
                <span>.app.erxes.io</span>
              </Domain>
            </FormGroup>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Main icon</ControlLabel>
            <p>Square transparent PNG, recommended around 150px wide.</p>
            <AvatarUpload
              avatar={icon}
              onAvatarUpload={handleAvatarUploader}
              title="icon"
              extraFormData={[{ key: "isPublic", value: "true" }]}
              defaultAvatar={avatar}
              square={true}
            />
          </FormGroup>
        </FlexRow>
        {isWhiteLabel && (
          <>
            <StatusTitle>{__("Company Branding")}</StatusTitle>
            <FlexRow>
              {this.renderMainLogo()}
              {this.renderFavicon()}
              {this.renderColors()}
            </FlexRow>
            {this.renderLoginPage()}
            {this.renderDNS()}
            <FlexRow>{this.renderEmailFields()}</FlexRow>
          </>
        )}
        <UpgradeButtons>{this.renderSaveButton()}</UpgradeButtons>
      </StatusBox>
    );
  }
}

export default OrganizationProfile;
