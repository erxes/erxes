import React from 'react'
import {
  __, ContentBox, Uploader, withTableWrapper, AvatarUpload, Button, ControlLabel, FormControl, FormGroup, HeaderDescription, Info,
  MainStyleTitle as Title, Wrapper,
} from 'erxes-ui';
import { SettingsContent } from '../../../erxes-plugin-loyalty/ui/styles';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { COLORS } from '../constants'
import companyBrandingFields from '../graphql/queries'



class Plugincomponent extends React.Component {
  constructor(props) {
    super(props)

    const { data } = props;
    const { textColor, backgroundColor, pageDesc, url, email, type } = data

    this.state = {
      backgroundColor: backgroundColor,
      textColor: textColor,
      pageDesc: pageDesc,
      url: url,
      email: email,
      type: type,
      emailTemplate: '',
    }

    this.save = this.save.bind(this);
  }

  save() {

    console.log(this.props)

    const {
      backgroundColor,
      pageDesc,
      textColor,
      url,
      email,
      type,
      emailTemplate,
    } = this.state;

    this.props.save({
      backgroundColor,
      pageDesc,
      textColor,
      url,
      email,
      type,
      emailTemplate,

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

  onChangeEmail = e => {
    this.setState({ email: e.target.value })
  }
  onChangeType = e => {
    this.setState({ type: e.target.value })
  }


  render() {
    // console.log(companyBrandingFields)
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

    const { textColor, pageDesc, backgroundColor, url, email, type, emailTemplate, } = this.state;

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
                  <AvatarUpload
                    extraFormData={[{ key: 'isPublic', value: 'true' }]}
                    width={300}
                    square={true}
                  />
                </div>
              </div >
              <div style={{ width: '50px' }}></div>
              <div style={{ display: 'table-cell' }}>
                <ControlLabel>main icon</ControlLabel>
                <p>150x150px<br />Transparent PNG</p>
                <AvatarUpload
                  extraFormData={[{ key: 'isPublic', value: 'true' }]}
                  width={300}
                  square={true}
                />
              </div >
              <div style={{ width: '50px' }}></div>
              <div style={{ display: 'table-cell' }}>
                <ControlLabel>Favicon</ControlLabel>
                <p>16x16px<br />Transparent PNG</p>
                <AvatarUpload
                  extraFormData={[{ key: 'isPublic', value: 'true' }]}
                  width={300}
                  square={true}
                />
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
                <ControlLabel>Email</ControlLabel>
                <p>Set an email address you wish to send your internal transactional emails<br />from. For example, task notification, team member mentions etc.</p>
                <FormGroup>

                  <FormControl
                    value={email || ''}
                    type="text"
                    componentClass="textarea"
                    required={false}
                    onChange={this.onChangeEmail}
                  />
                </FormGroup>
              </div >
              <div style={{ width: '50px' }}></div>
              <div style={{ display: 'table-cell', position: '' }}>
                <FormGroup>
                  <ControlLabel>Type</ControlLabel>
                  <p>Choose "custom" to change the template of transactional emails.</p>
                  <FormGroup>
                    <FormControl
                      componentClass="select"
                      value={type}
                      onChange={this.onChangeType}
                    >
                      <option key="simple" value="simple">
                        Simple
                      </option>
                      <option key="custom" value="custom">
                        Custom
                      </option>
                    </FormControl>
                  </FormGroup>
                </FormGroup>
              </div >
            </div><br />
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
        // header={
        //   <Wrapper.Header
        //     title={__('Company Branding')}
        //     color="#3B85F4"
        //   />
        // }
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