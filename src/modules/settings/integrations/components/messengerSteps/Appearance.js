import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import { uploadHandler } from 'modules/common/utils';
import { LeftItem, FlexItem } from 'modules/common/components/step/styles';
import {
  WidgetBackgrounds,
  SubHeading,
  SubItem,
  ColorPick,
  BackgroundSelector,
  ColorPicker
} from 'modules/settings/styles';

const propTypes = {
  onChange: PropTypes.func,
  color: PropTypes.string.isRequired,
  logoPreviewUrl: PropTypes.string,
  wallpaper: PropTypes.string.isRequired
};

class Appearance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.color,
      wallpaper: props.wallpaper
    };

    this.onChange = this.onChange.bind(this);
    this.handleLogoChange = this.handleLogoChange.bind(this);
  }

  onChange(name, value) {
    this.props.onChange(name, value);
    this.setState({ [name]: value });
  }

  handleLogoChange(e) {
    const imageFile = e.target.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.onChange('logoPreviewStyle', { opacity: '0.7' });
      },

      afterUpload: ({ response }) => {
        this.onChange('logo', response);
        this.onChange('logoPreviewStyle', { opacity: '1' });
      },

      afterRead: ({ result }) => {
        this.onChange('logoPreviewUrl', result);
      }
    });
  }

  renderWallpaperSelect(value) {
    const isSelected = this.state.wallpaper === value;
    const selectorClass = classnames({ selected: isSelected });

    return (
      <BackgroundSelector
        className={selectorClass}
        onClick={() => this.onChange('wallpaper', value)}
        style={{ borderColor: isSelected ? this.state.color : 'transparent' }}
      >
        <div className={`background-${value}`} />
      </BackgroundSelector>
    );
  }

  renderUploadImage(title) {
    return (
      <SubItem>
        <SubHeading>{title}</SubHeading>
        <input type="file" onChange={this.handleLogoChange} />
      </SubItem>
    );
  }

  render() {
    const { __ } = this.context;

    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker
          color={this.state.color}
          onChange={e => this.onChange('color', e.hex)}
        />
      </Popover>
    );

    return (
      <FlexItem odd>
        <LeftItem>
          <SubItem>
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
          </SubItem>

          <SubItem>
            <SubHeading>{__('Choose a wallpaper')}</SubHeading>

            <WidgetBackgrounds>
              {this.renderWallpaperSelect('1')}
              {this.renderWallpaperSelect('2')}
              {this.renderWallpaperSelect('3')}
              {this.renderWallpaperSelect('4')}
              {this.renderWallpaperSelect('5')}
            </WidgetBackgrounds>
          </SubItem>

          {this.renderUploadImage(__('Choose a logo'))}
        </LeftItem>
      </FlexItem>
    );
  }
}

Appearance.propTypes = propTypes;
Appearance.contextTypes = {
  __: PropTypes.func
};

export default Appearance;
