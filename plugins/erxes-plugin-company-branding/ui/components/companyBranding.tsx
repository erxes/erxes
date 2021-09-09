import React from 'react'
import {
  StatusBox,
  StatusTitle,
  FlexRow,
  ClearButton,
  ColorPickerWrapper,
  Domain
} from '../styles';
import {
  __,
  FormGroup,
  ControlLabel,
  FormControl,
  AvatarUpload,
  Tip,
  Icon,
  Button
} from 'erxes-ui';
import { FullContent, MiddleContent } from '../../../../ui/src/modules/common/styles/main'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { ColorPick, ColorPicker } from '../../../../ui/src/modules/settings/styles';
import EmailConfigForm from '../../../../ui/src/modules/settings/general/components/EmailConfigForm';
import { COLORS } from '../constants'
import { IConfigsMap, companyBrandingResponse } from '../general/types'
type Props = {
  configsMap: IConfigsMap;
  data: companyBrandingResponse;
  save: (
    {
      loginPageLogo,
      mainIcon,
      favicon,
      textColor,
      backgroundColor,
      pageDesc,
      url,
      map
    }: {
      loginPageLogo: string,
      mainIcon: string,
      favicon: string,
      pageDesc: string,
      backgroundColor: string,
      textColor: string,
      url: string,
      map:IConfigsMap
    },
    callback?: () => void
  ) => void;
}
type State = {
     loginPageLogo: string,
      mainIcon: string,
      favicon: string,
      pageDesc: string,
      backgroundColor: string,
      textColor: string,
      url: string,
      configsMap:IConfigsMap,
      isSaved: boolean;
}

class Plugincomponent extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props)
    const { loginPageLogo, mainIcon, favicon, textColor, backgroundColor, pageDesc, url } = props.data;
    this.state = {
      loginPageLogo: loginPageLogo,
      mainIcon: mainIcon,
      favicon: favicon,
      pageDesc: pageDesc,
      backgroundColor: backgroundColor,
      textColor: textColor,
      url: url,
      configsMap: props.configsMap,
      isSaved: false
    }
    this.save = this.save.bind(this);
  };

  save = () => {
    const { save } = this.props;

    const {
      loginPageLogo,
      mainIcon,
      favicon,
      pageDesc,
      backgroundColor,
      textColor,
      url,
      configsMap
    } = this.state;
    save({
      loginPageLogo,
      mainIcon,
      favicon,
      textColor,
      backgroundColor,
      pageDesc,
      url,
      map: configsMap
    });
    this.setState({ isSaved: true });
  }

  onUpload = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as any);
  };

  renderLoginPageLogo = () => {
    const handleAvatarUploader = url => this.onUpload('loginPageLogo', url);
    return (
      <FormGroup>
        <ControlLabel>Login page Logo</ControlLabel>
        <p>Transparent PNG, around 3:1 aspect ratio. Max width: 600px.</p>
        <AvatarUpload
          avatar={this.state.loginPageLogo}
          onAvatarUpload={handleAvatarUploader}
          defaultAvatar={this.state.loginPageLogo}
        />
      </FormGroup>
    );
  };
  renderFavicon = () => {
    const { favicon } = this.state;
    const handleAvatarUploader = url => this.onUpload('favicon', url);

    return (
      <FormGroup>
        <ControlLabel>Favicon</ControlLabel>
        <p>16x16px transparent PNG.</p>
        <AvatarUpload
          onAvatarUpload={handleAvatarUploader}
          avatar={favicon}
          defaultAvatar={favicon}
        />
      </FormGroup>
    );
  };
  renderMainIcon = () => {
    const handleAvatarUploader = url => this.onUpload('mainIcon', url);

    return (
      <FormGroup>
        <ControlLabel>Main icon</ControlLabel>
        <p>Square transparent PNG, recommended around 150px wide.</p>
        <AvatarUpload
          avatar={this.state.mainIcon}
          onAvatarUpload={handleAvatarUploader}
        />
      </FormGroup>
    );
  };
  renderColors = () => {
    const { backgroundColor, textColor } = this.state

    const colorPopover = (color, onChange, id: string) => {
      return (
        <Popover id={id}>
          <TwitterPicker
            width="266px"
            triangle="hide"
            color={{ hex: color }}
            onChange={onChange}
            colors={COLORS}
          />
        </Popover>
      );
    };
    const onBackgroundColorChange = e => {
      this.setState({ backgroundColor: e.hex });
    }
    const ontextColorChange = e => {
      this.setState({ textColor: e.hex });
    }

    const backgroundPopover = colorPopover(
      backgroundColor,
      onBackgroundColorChange,
      'background-popover'
    );
    const textPopover = colorPopover(
      textColor,
      ontextColorChange,
      'textColor-popover'
    );
    const clearBackground = () => {
      this.setState({ backgroundColor: '' });
    }
    const clearTextColor = () => {
      this.setState({ textColor: '' });
    }
    return (
      <>
        <FormGroup>
          <ControlLabel>Text color</ControlLabel>
          <Tip text={__('Clear text color')} placement="top">
            <ClearButton>
              <Icon icon="history" onClick={clearTextColor} />
            </ClearButton>
          </Tip>
          <p>Used on the login page text</p>
          <ColorPickerWrapper>
            <OverlayTrigger
              trigger="click"
              rootClose={true}
              placement="bottom"
              overlay={textPopover}
            >
              <ColorPick>
                <ColorPicker style={{ backgroundColor: textColor }} />
              </ColorPick>
            </OverlayTrigger>
          </ColorPickerWrapper>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Background</ControlLabel>
          <Tip text={__('Clear background')} placement="top">
            <ClearButton>
              <Icon icon="history" onClick={clearBackground} />
            </ClearButton>
          </Tip>
          <p>Used on the login background</p>
          <ColorPickerWrapper>
            <OverlayTrigger
              trigger="click"
              rootClose={true}
              placement="bottom"
              overlay={backgroundPopover}
            >
              <ColorPick>
                <ColorPicker style={{ backgroundColor }} />
              </ColorPick>
            </OverlayTrigger>
          </ColorPickerWrapper>
        </FormGroup>
      </>
    )
  };
  renderDNS = () => {
    const { pageDesc, url } = this.state

    const onChangedescription = e =>
      onChangeInput('pageDesc', (e.target as HTMLInputElement).value);

    const onChangeURL = e =>
      onChangeInput('url', (e.target as HTMLInputElement).value);

    const onChangeInput = (name, value) => {
      this.setState({ [name]: value } as any);
    };

    return (
      <>
        <FlexRow>
          <FormGroup>
            <ControlLabel>Login Page Description</ControlLabel>
            <p>Used on the login page description under the logo</p>
            <FormControl
              value={pageDesc || ''}
              type="text"
              componentClass="textarea"
              onChange={onChangedescription}
              required={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Redirect to home URL</ControlLabel>
            <p>Used under the description as a hyperlink for "Go to home page"</p>
            <Domain>
              <FormControl
                name="subdomain"
                value={url || 'https://'}
                type="text"
                onChange={onChangeURL}
                required={true}
              />
            </Domain>
          </FormGroup>
        </FlexRow>
      </>
    )
  };
  renderEmailFields = () => {

    const { configsMap } = this.state;
    const onChangeConfig = (code: string, value) => {
      configsMap[code] = value;
      this.setState({ configsMap });
    };
    const onChangeEmailConfig = (emailConfig: any) => {
      onChangeConfig('COMPANY_EMAIL_FROM', emailConfig.email);
      onChangeConfig('COMPANY_EMAIL_TEMPLATE_TYPE', emailConfig.type);
      onChangeConfig('COMPANY_EMAIL_TEMPLATE', emailConfig.template);
    };
    return (
      <FormGroup>
        <EmailConfigForm
          emailConfig={{
            email: configsMap.COMPANY_EMAIL_FROM,
            type: configsMap.COMPANY_EMAIL_TEMPLATE_TYPE,
            template: configsMap.COMPANY_EMAIL_TEMPLATE
          }}
          emailText="Set an email address you wish to send your internal transactional emails from. For example, task notifications, team member mentions, etc."
          setEmailConfig={onChangeEmailConfig}
          isSaved={this.state.isSaved}
        />
      </FormGroup>
    );
  };
  renderSaveButton() {
    return (
      <Button btnStyle="success" uppercase={false} onClick={this.save}>
        Save Organization
      </Button>
    );
  }
  render() {

    return (
      <FullContent center={true}>
        <MiddleContent transparent={true}>
          <StatusBox largePadding={true}>
            <StatusTitle>{__('Company Branding')}</StatusTitle>
            <FlexRow>
              {this.renderLoginPageLogo()}
              {this.renderMainIcon()}
              {this.renderFavicon()}
              {this.renderColors()}
            </FlexRow>
            {this.renderDNS()}
            {this.renderEmailFields()}
            {this.renderSaveButton()}
          </StatusBox>
        </MiddleContent>
      </FullContent>

    )
  }
}
export default Plugincomponent


