import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import { uploadHandler } from 'modules/common/utils';
import {
  FormControl,
  FormGroup,
  ControlLabel,
  Icon
} from 'modules/common/components';
import SelectBrand from '../SelectBrand';
import { CommonPreview } from './';
import {
  LeftItem,
  Preview,
  FlexItem
} from 'modules/common/components/step/styles';
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
  integration: PropTypes.object,
  brandId: PropTypes.string,
  languageCode: PropTypes.string,
  brands: PropTypes.array.isRequired,
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

    this.onChangeFunction = this.onChangeFunction.bind(this);
    this.handleLogoChange = this.handleLogoChange.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  onChangeFunction(name, value) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  updateInstallCodeValue(brandId) {
    if (brandId) {
      this.props.onChange('brandId', brandId);
    }
  }

  removeImage(value) {
    this.setState({ logoPreviewUrl: '' });
    this.props.onChange('logoPreviewUrl', value);
  }

  handleBrandChange(e) {
    this.updateInstallCodeValue(e.target.value);
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
        this.props.onChange('logoPreviewUrl', result);
      }
    });
  }

  renderWallpaperSelect(value) {
    const isSelected = this.state.wallpaper === value;
    const selectorClass = classnames({ selected: isSelected });

    return (
      <BackgroundSelector
        className={selectorClass}
        onClick={() => this.onChangeFunction('wallpaper', value)}
        style={{ borderColor: isSelected ? this.state.color : 'transparent' }}
      >
        <div className={`background-${value}`} />
      </BackgroundSelector>
    );
  }

  renderUploadImage() {
    if (!this.props.logoPreviewUrl) {
      return <input type="file" onChange={this.handleLogoChange} />;
    }

    return (
      <Fragment>
        <img src={this.props.logoPreviewUrl} alt="previewLogo" />
        <Icon
          icon="cancel-1"
          size={15}
          onClick={e => this.removeImage(e.target.value)}
        />
      </Fragment>
    );
  }

  render() {
    const { __ } = this.context;

    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker
          color={this.state.color}
          onChange={e => this.onChangeFunction('color', e.hex)}
        />
      </Popover>
    );

    return (
      <FlexItem odd>
        <LeftItem>
          <SelectBrand
            brands={this.props.brands}
            defaultValue={this.props.brandId}
            onChange={this.handleBrandChange}
          />

          <FormGroup>
            <ControlLabel>Language</ControlLabel>

            <FormControl
              componentClass="select"
              id="languageCode"
              defaultValue={this.props.languageCode}
              onChange={e =>
                this.onChangeFunction('languageCode', e.target.value)
              }
            >
              <option />
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </FormControl>
          </FormGroup>

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

          <SubItem>
            <SubHeading>{__('Choose a logo')}</SubHeading>
            {this.renderUploadImage()}
          </SubItem>
        </LeftItem>
        <Preview>
          <CommonPreview
            {...this.props}
            handleLogoChange={this.handleLogoChange}
          />
        </Preview>
      </FlexItem>
    );
  }
}

Appearance.propTypes = propTypes;
Appearance.contextTypes = {
  __: PropTypes.func
};

export default Appearance;
