import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { FlexItem, LeftItem } from "@erxes/ui/src/components/step/styles";
import { __ } from "@erxes/ui/src/utils/core";
import { ColorPick, ColorPicker } from "@erxes/ui/src/styles/main";
import { SubItem } from "@erxes/ui-settings/src/styles";
import React from "react";
import Popover from "@erxes/ui/src/components/Popover";
import TwitterPicker from "react-color/lib/Twitter";

type NameInput =
  | "companyName"
  | "slug"
  | "color"
  | "submitText"
  | "thankYouText";

type Props = {
  onChange: (name: NameInput, value: string) => void;
  companyName?: string;
  slug?: string;
  color?: string;
  submitText?: string;
  thankYouText?: string;
};

type State = {
  companyName?: string;
  slug?: string;
  color?: string;
  submitText?: string;
  thankYouText?: string;
};

class PageStyles extends React.Component<Props, State> {
  onChangeInput = (name: NameInput, e: React.FormEvent) => {
    const { value } = e.target as HTMLInputElement;

    this.setState({ [name]: value }, () => this.props.onChange(name, value));
  };

  onChangeColor = (name: "color", e: any) => {
    const value = e.hex;

    this.setState({ [name]: value }, () => this.props.onChange(name, value));
  };

  renderField = (name: NameInput, label: string) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>

        <FormControl
          value={this.props[name]}
          onChange={this.onChangeInput.bind(null, name)}
        />
      </FormGroup>
    );
  };

  render() {
    const { color } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          {this.renderField("companyName", "Company name")}

          <SubItem>
            <ControlLabel>{__("Choose a background color")}</ControlLabel>
            <Popover
              trigger={
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: color }} />
                </ColorPick>
              }
              placement="bottom-start"
            >
              <TwitterPicker
                color={color}
                onChange={this.onChangeColor.bind(null, "color")}
                triangle="hide"
              />
            </Popover>
          </SubItem>

          {this.renderField("slug", "Custom page slug")}
          {this.renderField("submitText", "Submit button label")}
          {this.renderField("thankYouText", "Thank you message")}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default PageStyles;
