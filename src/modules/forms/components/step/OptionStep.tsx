import {
  ControlLabel,
  FormControl,
  FormGroup
} from "modules/common/components";
import { LeftItem, Preview } from "modules/common/components/step/styles";
import { __ } from "modules/common/utils";
import React, { Component, Fragment } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { ChromePicker } from "react-color";
import { FormPreview } from "./preview";
import { BackgroundSelector, ColorPicker, FlexItem, Picker } from "./style";

type Props = {
  type: string;
  formTitle: string;
  formBtnText: string;
  formDesc: string;
  color: string;
  theme: string;
  language: string;
  onChange: (name, value) => void;
  fields: any;
  brand: any;
  brands: any;
  onFieldEdit?: () => void;
};

class OptionStep extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.onColorChange = this.onColorChange.bind(this);
    this.onChangeFunction = this.onChangeFunction.bind(this);
  }

  onChangeFunction(name: string, value: string) {
    this.props.onChange(name, value);
  }

  onColorChange(e) {
    this.setState({ color: e.hex, theme: "#000" }, () => {
      this.props.onChange("color", e.hex);
      this.props.onChange("theme", "");
    });
  }

  renderThemeColor(value: string) {
    return (
      <BackgroundSelector
        selected={this.props.theme === value}
        onClick={() => this.onChangeFunction("theme", value)}
      >
        <div style={{ backgroundColor: value }} />
      </BackgroundSelector>
    );
  }

  render() {
    const { brands, language, brand = {} } = this.props;

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
              onChange={(e: React.FormEvent<HTMLInputElement>) =>
                this.onChangeFunction("brand", e.currentTarget.value)
              }
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
              onChange={(e: React.FormEvent<HTMLInputElement>) =>
                this.onChangeFunction("language", e.currentTarget.value)
              }
            >
              <option />
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Theme color</ControlLabel>
            <p>{__("Try some of these colors:")}</p>
          </FormGroup>

          <Fragment>
            {this.renderThemeColor("#04A9F5")}
            {this.renderThemeColor("#392a6f")}
            {this.renderThemeColor("#fd3259")}
            {this.renderThemeColor("#67C682")}
            {this.renderThemeColor("#F5C22B")}
            {this.renderThemeColor("#2d2d32")}
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
          </Fragment>
        </LeftItem>

        <Preview>
          <FormPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

export default OptionStep;
