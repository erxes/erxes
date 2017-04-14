import React, { PropTypes, Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import {
  Button,
  ButtonGroup,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';
import WidgetPreview from './WidgetPreview.jsx';


class Appearance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.prevOptions.color || '#452679',
      wallpaper: props.prevOptions.wallpaper || '1',
    };

    this.save = this.save.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onWallpaperChange = this.onWallpaperChange.bind(this);
  }

  onColorChange(e) {
    this.setState({ color: e.hex });
  }

  onWallpaperChange(value) {
    this.setState({ wallpaper: value });
  }

  save(e) {
    e.preventDefault();

    this.props.save(this.state);
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

    const content = (
      <div className="margined">
        <div className="widget-appearance type-box">
          <div>
            <WidgetPreview
              color={this.state.color}
              wallpaper={this.state.wallpaper}
              user={this.props.user}
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
