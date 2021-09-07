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
import { IConfigsMap } from '../general/types'
type Props = {
  configsMap: IConfigsMap;
}

class Plugincomponent extends React.Component<Props>{
  constructor(props: Props) {
    super(props)
    const { data } = props;
    const { loginPageLogo, mainIcon, favicon, textColor, backgroundColor, pageDesc, url } = data
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

  save() {

    const {
      loginPageLogo,
      mainIcon,
      favicon,
      textColor,
      backgroundColor,
      pageDesc,
      url,
      configsMap
    } = this.state;
    this.props.save({
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

  onUpload = (name, value) => {
    this.setState({ [name]: value })

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
          title="logo"
          extraFormData={[{ key: 'isPublic', value: 'true' }]}
          square={true}
          width={300}
        />
      </FormGroup>
    );
  };
  renderFavicon = () => {
    const handleAvatarUploader = url => this.onUpload('favicon', url);

    return (
      <FormGroup>
        <ControlLabel>Favicon</ControlLabel>
        <p>16x16px transparent PNG.</p>
        <AvatarUpload
          
          onAvatarUpload={handleAvatarUploader}
          avatar={this.state.favicon}
          title="favicon"
          extraFormData={[{ key: 'isPublic', value: 'true' }]}
          square={true}
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
          title="mainIcon"
          extraFormData={[{ key: 'isPublic', value: 'true' }]}
          square={true}
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


