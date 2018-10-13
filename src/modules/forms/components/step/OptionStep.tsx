import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { LeftItem, Preview } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { IField } from 'modules/settings/properties/types';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { ChromePicker } from 'react-color';
import { IBrand } from '../../../settings/brands/types';
import { FormPreview } from './preview';
import { BackgroundSelector, ColorPicker, FlexItem, Picker } from './style';

type Props = {
  type: string;
  formTitle?: string;
  formBtnText?: string;
  formDesc?: string;
  color: string;
  theme: string;
  language?: string;
  onChange: (
    name: 'brand' | 'color' | 'theme' | 'language',
    value: string
  ) => void;
  fields?: IField[];
  brand?: IBrand;
  brands?: IBrand[];
  onFieldEdit?: () => void;
};

class OptionStep extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.onColorChange = this.onColorChange.bind(this);
    this.onChangeFunction = this.onChangeFunction.bind(this);
  }

  onChangeFunction(name: any, value: string) {
    this.props.onChange(name, value);
  }

  onColorChange(e) {
    this.setState({ color: e.hex, theme: '#000' }, () => {
      this.props.onChange('color', e.hex);
      this.props.onChange('theme', '');
    });
  }

  renderThemeColor(value: string) {
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
    const { brands, language, brand } = this.props;

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
              defaultValue={brand ? brand._id : ''}
              id="selectBrand"
              onChange={(e: React.FormEvent<HTMLElement>) =>
                this.onChangeFunction(
                  'brand',
                  (e.currentTarget as HTMLInputElement).value
                )
              }
            >
              <option />
              {brands &&
                brands.map(brandOption => (
                  <option key={brandOption._id} value={brandOption._id}>
                    {brandOption.name}
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
              onChange={(e: React.FormEvent<HTMLElement>) =>
                this.onChangeFunction(
                  'language',
                  (e.currentTarget as HTMLInputElement).value
                )
              }
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

          <React.Fragment>
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
          </React.Fragment>
        </LeftItem>

        <Preview>
          <FormPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

export default OptionStep;
