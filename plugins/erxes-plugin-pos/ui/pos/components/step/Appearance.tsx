import { ControlLabel } from "modules/common/components/form";
import { LeftItem } from "erxes-ui/lib/components/step/styles";
import { __, uploadHandler, FormGroup, AvatarUpload } from "erxes-ui";
import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import TwitterPicker from "react-color/lib/Twitter";
import {
  AppearanceRow,
  ColorPick,
  ColorPicker,
  FlexItem,
  SubItem,
  Block,
  LogoWrapper,
  ColorPickerWrap,
  ColorChooserTile,
} from "../../../styles";

interface IColor {
  [key: string]: string;
}

export interface IUIOptions {
  colors: IColor;
  logo: string;
  bgImage: string;
  favIcon: string;
}

type Props = {
  onChange: (
    name: "uiOptions" | "logoPreviewUrl" | "logoPreviewStyle",
    value: any
  ) => void;
  uiOptions?: IUIOptions;
  logoPreviewUrl: string;
};

type State = {
  uiOptions: IUIOptions;
};

class Appearance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const uiOptions = props.uiOptions || {};

    this.state = { uiOptions };
  }

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onChangeAppearance = (name: any, value: any) => {
    this.props.onChangeAppearance(name, value);
  };

  handleLogoChange = (e) => {
    const { uiOptions } = this.props;
    const imageFile = e.target.files;

    const key = e.target.id;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.onChangeFunction("logoPreviewStyle", { opacity: "0.7" });
      },

      afterUpload: ({ response }) => {
        uiOptions[key] = response;
        this.onChangeFunction("uiOptions", uiOptions);
        this.onChangeFunction("logoPreviewStyle", { opacity: "1" });
      },

      afterRead: ({ result }) => {
        this.onChangeFunction("logoPreviewUrl", result);
      },
    });
  };

  renderUploadImage(id, title, desc) {
    return (
      <LogoWrapper>
        <FormGroup>
          <ControlLabel>{__(title)}</ControlLabel>
          <p>{__(desc)}</p>
          <AvatarUpload
            avatar={this.state.uiOptions[id] || ""}
            onAvatarUpload={this.handleLogoChange}
          />
        </FormGroup>
      </LogoWrapper>
    );
  }

  renderPicker(group, key, title, colour) {
    const { uiOptions } = this.props;

    const color =
      uiOptions[group] && uiOptions[group][key]
        ? uiOptions[group][key]
        : colour;

    const onChangeColor = (e) => {
      uiOptions[group][key] = e.hex;

      this.onChangeFunction("uiOptions", uiOptions);
    };

    const popoverContent = (
      <Popover id={key}>
        <TwitterPicker color={color} onChange={onChangeColor} triangle="hide" />
      </Popover>
    );

    return (
      <FormGroup>
        <ColorChooserTile>{title}</ColorChooserTile>
        <div>
          <OverlayTrigger
            trigger="click"
            rootClose={true}
            placement="bottom-start"
            overlay={popoverContent}
          >
            <ColorPick>
              <ColorPicker style={{ backgroundColor: color }} />
            </ColorPick>
          </OverlayTrigger>
        </div>
      </FormGroup>
    );
  }

  render() {
    return (
      <FlexItem>
        <LeftItem>
          <Block>
            <h4>{__("Logo and favicon")}</h4>
            <AppearanceRow>
              {this.renderUploadImage("logo", "Main Logo", "Pos main logo PNG")}
              {this.renderUploadImage(
                "bgImage",
                "Background Image",
                "Pos background Image PNG"
              )}
              {this.renderUploadImage(
                "favIcon",
                "Favicon",
                "16x16px transparent PNG"
              )}
            </AppearanceRow>
          </Block>
          <Block>
            <h4>{__("Main colors")}</h4>
            <FormGroup>
              <ControlLabel>{__("Colors")}</ControlLabel>
              <AppearanceRow>
                <ColorPickerWrap>
                  {this.renderPicker("colors", "primary", "Primary", "#6569df")}
                  {this.renderPicker(
                    "colors",
                    "secondary",
                    "Secondary",
                    "#3fc7cc"
                  )}
                </ColorPickerWrap>
              </AppearanceRow>
            </FormGroup>
          </Block>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Appearance;
