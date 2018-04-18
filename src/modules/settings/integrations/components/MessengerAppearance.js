import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import { uploadHandler } from 'modules/common/utils';
import { Button, Icon, Tip } from 'modules/common/components';
import { ActionBar, Wrapper } from 'modules/layout/components';
import { MessengerPreview, Messenger } from 'modules/engage/styles';
import Sidebar from '../Sidebar';
import { WidgetPreview } from './';
import {
  SubHeading,
  Margined,
  WidgetApperance,
  WidgetSettings,
  WidgetBackgrounds,
  WidgetBox,
  ColorPick,
  BackgroundSelector,
  ColorPicker,
  LogoContainer
} from '../../styles';

class Appearance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.prevOptions.color || '#6569DF',
      wallpaper: props.prevOptions.wallpaper || '1',
      logo: props.prevOptions.logo,
      logoPreviewStyle: {},
      logoPreviewUrl: props.prevOptions.logo || '/images/logo-image.png'
    };

    this.save = this.save.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onWallpaperChange = this.onWallpaperChange.bind(this);
    this.handleLogoChange = this.handleLogoChange.bind(this);
  }

  onColorChange(e) {
    this.setState({ color: e.hex });
  }

  onWallpaperChange(value) {
    this.setState({ wallpaper: value });
  }

  handleLogoChange(e) {
    const imageFile = e.target.files[0];

    uploadHandler({
      file: imageFile,

      beforeUpload: () => {
        this.setState({ logoPreviewStyle: { opacity: '0.9' } });
      },

      afterUpload: ({ response }) => {
        this.setState({
          logo: response,
          logoPreviewStyle: { opacity: '1' }
        });
      },

      afterRead: ({ result }) => {
        this.setState({ logoPreviewUrl: result });
      }
    });
  }

  save(e) {
    e.preventDefault();

    this.props.save({
      color: this.state.color,
      wallpaper: this.state.wallpaper,
      logo: this.state.logo
    });
  }

  renderWallpaperSelect(value) {
    const isSelected = this.state.wallpaper === value;
    const selectorClass = classnames({ selected: isSelected });

    return (
      <BackgroundSelector
        className={selectorClass}
        onClick={() => this.onWallpaperChange(value)}
        style={{ borderColor: isSelected ? this.state.color : 'transparent' }}
      >
        <div className={`background-${value}`} />
      </BackgroundSelector>
    );
  }

  render() {
    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker color={this.state.color} onChange={this.onColorChange} />
      </Popover>
    );

    const { logoPreviewStyle, logoPreviewUrl } = this.state;
    const { __ } = this.context;

    const content = (
      <Margined>
        <WidgetApperance className="type-box">
          <WidgetSettings>
            <WidgetBox>
              <SubHeading>{__('Choose a custom color')}</SubHeading>
              <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom"
                overlay={popoverTop}
              >
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: this.state.color }} />
                </ColorPick>
              </OverlayTrigger>
            </WidgetBox>

            <WidgetBox>
              <SubHeading>{__('Choose a wallpaper')}</SubHeading>

              <WidgetBackgrounds>
                {this.renderWallpaperSelect('1')}
                {this.renderWallpaperSelect('2')}
                {this.renderWallpaperSelect('3')}
                {this.renderWallpaperSelect('4')}
                {this.renderWallpaperSelect('5')}
              </WidgetBackgrounds>
            </WidgetBox>

            <WidgetBox>
              <SubHeading>{__('Choose a logo')}</SubHeading>

              <input type="file" onChange={this.handleLogoChange} />
            </WidgetBox>
          </WidgetSettings>

          <MessengerPreview>
            <Messenger>
              <WidgetPreview
                color={this.state.color}
                wallpaper={this.state.wallpaper}
                user={this.props.user}
              />
              <Tip text={__('Choose a logo')}>
                <LogoContainer
                  style={Object.assign(
                    {
                      backgroundColor: this.state.color,
                      backgroundImage: `url(${logoPreviewUrl})`
                    },
                    logoPreviewStyle
                  )}
                >
                  <label>
                    <Icon
                      erxes
                      icon="upload icon"
                      size={30}
                      style={{ backgroundColor: this.state.color }}
                    />
                    <input type="file" onChange={this.handleLogoChange} />
                  </label>
                </LogoContainer>
              </Tip>
            </Messenger>
          </MessengerPreview>
        </WidgetApperance>
      </Margined>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings/integrations' },
      { title: __('Integrations') }
    ];

    const actionBar = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/integrations">
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>

            <Button
              size="small"
              btnStyle="success"
              onClick={this.save}
              icon="checked-1"
            >
              Save
            </Button>
          </Button.Group>
        }
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        footer={actionBar}
        content={content}
      />
    );
  }
}

Appearance.propTypes = {
  prevOptions: PropTypes.object.isRequired, // eslint-disable-line
  user: PropTypes.object.isRequired, // eslint-disable-line
  save: PropTypes.func.isRequired
};

Appearance.contextTypes = {
  __: PropTypes.func
};

export default Appearance;
