import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import { uploadHandler } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import Sidebar from '../../Sidebar';
import WidgetPreview from './WidgetPreview';
import { Button, Icon } from 'modules/common/components';
import {
  SubHeading,
  Margined,
  WidgetApperance,
  WidgetSettings,
  WidgetBox,
  ColorPick,
  ColorPicker,
  LogoContainer
} from '../../styles';

class Appearance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.prevOptions.color || '#452679',
      wallpaper: props.prevOptions.wallpaper || '1',
      logo: props.prevOptions.logo,
      logoPreviewStyle: {},
      logoPreviewUrl: props.prevOptions.logo || '/images/widget-logo.png'
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
        this.setState({ logoPreviewStyle: { opacity: '0.2' } });
      },

      afterUpload: ({ response }) => {
        this.setState({
          logo: response.url,
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
    const selectorClass = classnames('background-selector', {
      selected: isSelected
    });

    return (
      <a
        href=""
        className={selectorClass}
        onClick={() => this.onWallpaperChange(value)}
        style={{ borderColor: isSelected ? this.state.color : 'transparent' }}
      >
        <div className={`background-${value}`} />
      </a>
    );
  }

  render() {
    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker color={this.state.color} onChange={this.onColorChange} />
      </Popover>
    );

    const { logo, logoPreviewStyle, logoPreviewUrl } = this.state;

    const content = (
      <Margined>
        <WidgetApperance className="type-box">
          <WidgetSettings>
            <WidgetBox>
              <SubHeading>Choose a custom color</SubHeading>
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
              <SubHeading>Choose a wallpaper</SubHeading>

              <div className="widget-backgrounds">
                {this.renderWallpaperSelect('1')}
                {this.renderWallpaperSelect('2')}
                {this.renderWallpaperSelect('3')}
                {this.renderWallpaperSelect('4')}
                {this.renderWallpaperSelect('5')}
              </div>
            </WidgetBox>

            <WidgetBox>
              <SubHeading>Choose a logo</SubHeading>

              <input type="file" onChange={this.handleLogoChange} />
              <input type="hidden" id="logo" value={logo} />
            </WidgetBox>
          </WidgetSettings>

          <WidgetSettings>
            <WidgetPreview
              color={this.state.color}
              wallpaper={this.state.wallpaper}
              user={this.props.user}
            />
            <LogoContainer
              style={Object.assign(
                {
                  backgroundColor: this.state.color,
                  backgroundImage: `url(${logoPreviewUrl})`
                },
                logoPreviewStyle
              )}
            />
          </WidgetSettings>
        </WidgetApperance>
      </Margined>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' }
    ];

    const actionBar = (
      <Wrapper.ActionBar
        right={
          <Button.Group>
            <Link to="/settings/integrations">
              <Button size="small" btnStyle="simple">
                <Icon icon="close" /> Cancel
              </Button>
            </Link>

            <Button size="small" btnStyle="success" onClick={this.save}>
              <Icon icon="checkmark" /> Save
            </Button>
          </Button.Group>
        }
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
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

export default Appearance;
