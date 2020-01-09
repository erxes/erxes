import { COLORS } from 'modules/boards/constants';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem, Preview } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import FieldsPreview from 'modules/forms/components/FieldsPreview';
import { IFormData } from 'modules/forms/types';
import SelectBrand from 'modules/settings/integrations/containers/SelectBrand';
import { IField } from 'modules/settings/properties/types';
import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import ChromePicker from 'react-color/lib/Chrome';
import { IBrand } from '../../../settings/brands/types';
import { FormPreview } from './preview';
import { BackgroundSelector, ColorList, FlexItem } from './style';

type Props = {
  type: string;
  formData: IFormData;
  color: string;
  theme: string;
  language?: string;
  onChange: (
    name: 'brand' | 'color' | 'theme' | 'language',
    value: string
  ) => void;
  fields?: IField[];
  brand?: IBrand;
  onFieldEdit?: () => void;
};

class OptionStep extends React.Component<Props, {}> {
  onChangeFunction = (name: any, value: string) => {
    this.props.onChange(name, value);
  };

  onColorChange = e => {
    this.setState({ color: e.hex, theme: '#000' }, () => {
      this.props.onChange('color', e.hex);
      this.props.onChange('theme', e.hex);
    });
  };

  renderThemeColor(value: string) {
    const onClick = () => this.onChangeFunction('theme', value);

    return (
      <BackgroundSelector
        key={value}
        selected={this.props.theme === value}
        onClick={onClick}
      >
        <div style={{ backgroundColor: value }} />
      </BackgroundSelector>
    );
  }

  render() {
    const { language, brand, formData, color, theme } = this.props;
    const { fields, desc } = formData;

    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker color={color} onChange={this.onColorChange} />
      </Popover>
    );

    const onChange = e =>
      this.onChangeFunction(
        'brand',
        (e.currentTarget as HTMLInputElement).value
      );

    const onChangeLanguage = e =>
      this.onChangeFunction(
        'language',
        (e.currentTarget as HTMLInputElement).value
      );

    const previewRenderer = () => (
      <FieldsPreview fields={fields || []} formDesc={desc} />
    );

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <SelectBrand
              isRequired={true}
              onChange={onChange}
              defaultValue={brand ? brand._id : ' '}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={language}
              id="languageCode"
              onChange={onChangeLanguage}
            >
              <option />
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Theme color</ControlLabel>
            <div>
              <OverlayTrigger
                trigger="click"
                rootClose={true}
                placement="bottom-start"
                overlay={popoverTop}
              >
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: theme }} />
                </ColorPick>
              </OverlayTrigger>
            </div>
            <br />
            <p>{__('Try some of these colors:')}</p>
            <ColorList>
              {COLORS.map(value => this.renderThemeColor(value))}
            </ColorList>
          </FormGroup>
        </LeftItem>

        <Preview>
          <FormPreview
            {...this.props}
            title={formData.title}
            btnText={formData.btnText}
            previewRenderer={previewRenderer}
          />
        </Preview>
      </FlexItem>
    );
  }
}

export default OptionStep;
