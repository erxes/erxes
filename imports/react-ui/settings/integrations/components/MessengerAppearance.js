import React, { PropTypes, Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Button, ButtonGroup, OverlayTrigger, Popover } from 'react-bootstrap';
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import uploadHandler from '/imports/api/client/uploadHandler';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar';
import WidgetPreview from './WidgetPreview';

class Appearance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.prevOptions.color || '#452679',
      wallpaper: props.prevOptions.wallpaper || '1',
      logo: props.prevOptions.logo,
      logoPreviewStyle: {},
      logoPreviewUrl: props.prevOptions.logo || '/images/widget-logo.png',
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
          logoPreviewStyle: { opacity: '1' },
        });
      },

      afterRead: ({ result }) => {
        this.setState({ logoPreviewUrl: result });
      },
    });
  }

  save(e) {
    e.preventDefault();

    this.props.save({
      color: this.state.color,
      wallpaper: this.state.wallpaper,
      logo: this.state.logo,
    });
  }

  renderWallpaperSelect(value) {
    const isSelected = this.state.wallpaper === value;
    const selectorClass = classnames('background-selector', {
      selected: isSelected,
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
      <div className="margined">
        <div className="widget-appearance type-box">
          <div>
            <WidgetPreview
              color={this.state.color}
              wallpaper={this.state.wallpaper}
              user={this.props.user}
            />
            <div
              className="logo-container"
              style={Object.assign(
                {
                  backgroundColor: this.state.color,
                  backgroundImage: `url(${logoPreviewUrl})`,
                },
                logoPreviewStyle,
              )}
            />
          </div>

          <div className="widget-settings">
            <div className="box">
              <h2>Choose a custom color</h2>
              <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popoverTop}>
                <div className="color-pick">
                  <div style={{ backgroundColor: this.state.color }} />
                </div>
              </OverlayTrigger>
            </div>

            <div className="box">
              <h2>Choose a wallpaper</h2>

              <div className="widget-backgrounds">
                {this.renderWallpaperSelect('1')}
                {this.renderWallpaperSelect('2')}
                {this.renderWallpaperSelect('3')}
                {this.renderWallpaperSelect('4')}
                {this.renderWallpaperSelect('5')}
              </div>
            </div>

            <div className="box">
              <h2>Choose a logo</h2>

              <input type="file" onChange={this.handleLogoChange} />
              <input type="hidden" id="logo" value={logo} />
            </div>
          </div>
        </div>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' },
    ];

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button bsStyle="link" onClick={this.save}>
              <i className="ion-checkmark-circled" /> Save
            </Button>

            <Button bsStyle="link" href={FlowRouter.path('/settings/integrations')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

Appearance.propTypes = {
  prevOptions: PropTypes.object.isRequired, // eslint-disable-line
  user: PropTypes.object.isRequired, // eslint-disable-line
  save: PropTypes.func.isRequired,
};

export default Appearance;
