import React from 'react'
import {
  __, ContentBox, AvatarUpload, Button, Info, ControlLabel, FormControl, FormGroup,
  MainStyleTitle as Title, Wrapper,
} from 'erxes-ui';
import { SettingsContent } from '../styles';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { COLORS } from '../constants'
// import EmailConfigForm from 'modules/settings/general/components/EmailConfigForm';
import EditorCK from 'modules/common/containers/EditorCK';

// const ContentWrapper = styled.div`
//   margin-top: 20px;
// `;
class Plugincomponent extends React.Component {

  constructor(props) {
    super(props)

    const { data } = props;
    const { loginPageLogo, mainIcon, favicon, textColor, backgroundColor, pageDesc, url, email, type, template } = data

    this.state = {
      loginPageLogo: loginPageLogo,
      mainIcon: mainIcon,
      favicon: favicon,
      backgroundColor: backgroundColor,
      textColor: textColor,
      pageDesc: pageDesc,
      url: url,
      email: email,
      type: type,
      template: template
    }

    this.save = this.save.bind(this);
  }

  save() {
    const {
      loginPageLogo,
      mainIcon,
      favicon,
      backgroundColor,
      pageDesc,
      textColor,
      url,
      email,
      type,
      template
    } = this.state;

    this.props.save({
      loginPageLogo,
      mainIcon,
      favicon,
      backgroundColor,
      pageDesc,
      textColor,
      url,
      email,
      type,
      template
    });

  };


  onTextColorChange = e => {
    this.setState({ textColor: e.hex });
  };

  onBackgroundColorChange = e => {
    this.setState({ backgroundColor: e.hex });
  };

  onChangeLoginPageDescription = e => {
    this.setState({ pageDesc: e.target.value })
  };

  onChangeRedirectHomeUrl = e => {
    this.setState({ url: e.target.value })
  };

  onUpload = (name, value) => {
    this.setState({ [name]: value })
  }

  onChangeConfig = (code, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  emailConfigForm = (email, type, template, emailText) => {
    // console.log("heeey", email, "suga",type, template)
    // const { data } = useQuery(gql(queries.configsGetEmailTemplate), {
    //   variables: {
    //     name: props.templateName
    //   }
    // });

    // const defaultTemplate = data ? data.configsGetEmailTemplate : {};

    const onChangeEmail = e => {
      this.setState({ email: e.target.value })
    };

    const onChangeType = e => {
      this.setState({ type: e.target.value })
    };

    const onEditorChange = e => {
      this.setState({ template: e.editor.getData() })
    };

    const renderTemplate = () => {
      if (type === 'custom') {
        return (

          <EditorCK
            content={template}
            onChange={onEditorChange}
            autoGrow={true}
            name="email_config"
          // isSubmitted={props.isSaved}
          />

        );
      }

      return (

        <Info>
          {__('Your email will be sent with Erxes email template') + '.'}
        </Info>

      );
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <p>{emailText}</p>

          <FormControl
            type="email"
            rows={5}
            value={email}
            onChange={onChangeEmail}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Type</ControlLabel>
          <p>Choose "custom" to change the template of transactional emails.</p>

          <FormControl
            componentClass="select"
            value={this.state.type}
            onChange={onChangeType}
          >
            <option key="simple" value="simple">
              Simple
            </option>
            <option key="custom" value="custom">
              Custom
            </option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Template</ControlLabel>

          {renderTemplate()}
        </FormGroup>
      </>
    );
  };

  render() {

    const colorPopover = (color, onChange) => {
      return (
        <Popover id={'id'}>
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

    const renderloginPageLogo = () => {
      const { loginPageLogo } = this.state;
      const handleAvatarUploader = url => this.onUpload('loginPageLogo', url);

      return (
        <AvatarUpload
          avatar={this.state.loginPageLogo}
          onAvatarUpload={handleAvatarUploader}
          title="loginPagelogo"
          extraFormData={[{ key: 'isPublic', value: 'true' }]}
          defaultAvatar={loginPageLogo}
          width={300}
          square={true}
        />
      );
    };

    const renderMainIcon = () => {
      const { mainIcon } = this.state;
      const handleAvatarUploader = url => this.onUpload('mainIcon', url);

      return (
        <AvatarUpload
          avatar={this.state.mainIcon}
          onAvatarUpload={handleAvatarUploader}
          title="mainIcon"
          extraFormData={[{ key: 'isPublic', value: 'true' }]}
          defaultAvatar={this.state.mainIcon}
          width={300}
          square={true}
        />
      );
    };

    const renderfavicon = () => {
      const { favicon } = this.state;
      const handleAvatarUploader = url => this.onUpload('favicon', url);

      return (
        <AvatarUpload
          avatar={this.state.favicon}
          onAvatarUpload={handleAvatarUploader}
          title="favicon"
          extraFormData={[{ key: 'isPublic', value: 'true' }]}
          defaultAvatar={favicon}
          width={300}
          square={true}
        />
      );
    };

    const renderEmailFields = () => {
      const { email, template, type } = this.state;
      const emailText = "Set an email address you wish to send your internal transactional emails from. For example, task notifications, team member mentions, etc."
      return this.emailConfigForm(email, type, template, emailText)
    }

    const { loginPagelogo, mainIcon, favicon, textColor, pageDesc, backgroundColor, url, email, type, emailTemplate, } = this.state;

    const backgroundPopover = colorPopover(
      backgroundColor,
      this.onBackgroundColorChange,
      'background-popover'
    );

    const textColorPopover = colorPopover(
      textColor,
      this.onTextColorChange,
      'textColor-popover'
    );

    const content = (
      <ContentBox>
        <SettingsContent>
          <FormGroup>
            <div style={{ display: 'table' }}>
              <div style={{ display: 'table-cell' }}>
                <ControlLabel>Login page logo</ControlLabel>
                <p>Transparent PNG, around 3:1 aspect ratio.<br /> Max width: 600px</p>
                <div style={{}}>
                  {renderloginPageLogo()}
                </div>
              </div >
              <div style={{ width: '50px' }}></div>
              <div style={{ display: 'table-cell' }}>
                <ControlLabel>main icon</ControlLabel>
                <p>150x150px<br />Transparent PNG</p>
                <div>
                  {renderMainIcon()}
                </div>
              </div >
              <div style={{ width: '50px' }}></div>
              <div style={{ display: 'table-cell' }}>
                <ControlLabel>Favicon</ControlLabel>
                <p>16x16px<br />Transparent PNG</p>
                <div>
                  {renderfavicon()}
                </div>
              </div >
              <div style={{ width: '50px' }}></div>
              <div style={{ display: 'table-cell' }}>
                <ControlLabel>text</ControlLabel>
                <p>used on the<br />login page text</p>
                <OverlayTrigger trigger="click"
                  rootClose
                  placement="bottom"
                  overlay={textColorPopover}
                >
                  <div style={{ borderRadius: '4px', display: 'inline-block', padding: '3px', border: '1px solid ', cursor: 'pointer' }}>
                    <div style={{ width: '92px', height: '92px', borderRadius: '2px', backgroundColor: `${textColor}` }}>

                    </div>
                  </div>

                </OverlayTrigger>
              </div >
              <div style={{ width: '50px' }}></div>
              <div style={{ display: 'table-cell' }}>
                <ControlLabel>background</ControlLabel>
                <p>used on the<br />login background</p>
                <OverlayTrigger trigger="click"
                  rootClose={true}
                  placement="bottom"
                  overlay={backgroundPopover}
                >
                  <div style={{ borderRadius: '4px', display: 'inline-block', padding: '3px', border: '1px solid ', cursor: 'pointer' }}>
                    <div style={{ width: '92px', height: '92px', borderRadius: '2px', backgroundColor: `${backgroundColor}` }}>

                    </div>
                  </div>

                </OverlayTrigger>

              </div >
            </div><br />
            <div style={{ display: 'table' }}>
              <div style={{ display: 'table-cell' }}>
                <ControlLabel>login page description</ControlLabel>
                <p>used on the login page description under the logo.</p>
                <FormGroup>

                  <FormControl
                    value={pageDesc || ''}
                    type="text"
                    componentClass="textarea"
                    required={false}
                    onChange={this.onChangeLoginPageDescription}
                  />
                </FormGroup>
              </div >
              <div style={{ width: '50px' }}></div>
              <div style={{ display: 'table-cell', position: '' }}>
                <ControlLabel>redirect to home url</ControlLabel>
                <p>used under the description as alyperlink for "Go to home page"</p>
                <FormGroup>

                  <FormControl
                    value={url || 'https://'}
                    type="text"
                    componentClass="textarea"
                    required={false}
                    onChange={this.onChangeRedirectHomeUrl}
                  />
                </FormGroup>
                {/* <FormControl
                  value={'' || ''}
                  type="text"
                  componentClass="textarea"
                  required={false}
                /> */}
              </div >
            </div><br />
            <div style={{ display: 'table' }}>
              <div style={{ display: 'table-cell' }}>
                {renderEmailFields()}
              </div>
            </div>
            <br />
            <div style={{ display: 'table' }}>
              <div style={{ display: 'table-cell' }}>
                <Button btnStyle="success" uppercase={false} onClick={this.save}>
                  Save Organization
                </Button>
              </div >
            </div>
          </FormGroup>
        </SettingsContent>
      </ContentBox>
    );

    return (
      <Wrapper
        center={true}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Company Branding')}</Title>}

          />
        }
        content={content}

      />
    );
  }

}


export default Plugincomponent