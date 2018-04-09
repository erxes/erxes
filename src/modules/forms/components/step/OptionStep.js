import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { ChromePicker } from 'react-color';
import {
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { FormPreview } from './preview';
import {
  FlexItem,
  LeftItem,
  Preview,
  ColorPick,
  ColorPicker,
  Picker,
  BackgroundSelector
} from './style';

const propTypes = {
  type: PropTypes.string,
  formTitle: PropTypes.string,
  formBtnText: PropTypes.string,
  formDesc: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  language: PropTypes.string,
  onChange: PropTypes.func,
  fields: PropTypes.array,
  brand: PropTypes.object,
  brands: PropTypes.array,
  onFieldEdit: PropTypes.func
};

class OptionStep extends Component {
  constructor(props) {
    super(props);

    this.onColorChange = this.onColorChange.bind(this);
    this.onChangeFunction = this.onChangeFunction.bind(this);
  }

  onChangeFunction(name, value) {
    this.props.onChange(name, value);
  }

  onColorChange(e) {
    this.setState({ color: e.hex, theme: '#000' }, () => {
      this.props.onChange('color', e.hex);
      this.props.onChange('theme', '');
    });
  }

  renderThemeColor(value) {
    return (
      <BackgroundSelector
        selected={this.props.theme === value}
        onClick={() => this.onChangeFunction('theme', value)}
      >
        <div style={{ backgroundColor: value }} />
      </BackgroundSelector>
    );
  }

  render() {
    const { brands, language, brand = {} } = this.props;
    const { __ } = this.context;

    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker color={this.props.color} onChange={this.onColorChange} />
      </Popover>
    );
    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Brand</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={brand._id}
              id="selectBrand"
              onChange={e => this.onChangeFunction('brand', e.target.value)}
            >
              <option />
              {brands &&
                brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={language}
              id="languageCode"
              onChange={e => this.onChangeFunction('language', e.target.value)}
            >
              <option />
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Theme color</ControlLabel>
            <p>{__('Try some of these colors:')}</p>
          </FormGroup>

          <ColorPick>
            {this.renderThemeColor('#04A9F5')}
            {this.renderThemeColor('#392a6f')}
            {this.renderThemeColor('#fd3259')}
            {this.renderThemeColor('#67C682')}
            {this.renderThemeColor('#F5C22B')}
            {this.renderThemeColor('#2d2d32')}
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={popoverTop}
            >
              <ColorPicker>
                <Picker style={{ backgroundColor: this.props.theme }} />
              </ColorPicker>
            </OverlayTrigger>
          </ColorPick>
        </LeftItem>

        <Preview>
          <FormPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

OptionStep.propTypes = propTypes;
OptionStep.contextTypes = {
  __: PropTypes.func
};

export default OptionStep;
