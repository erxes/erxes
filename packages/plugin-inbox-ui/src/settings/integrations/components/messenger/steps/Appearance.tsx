import { LogoWrapper } from '@erxes/ui-inbox/src/settings/integrations/styles';
import { TEXT_COLORS } from "@erxes/ui-sales/src/boards/constants";
import {
  BackgroundSelector,
  SubItem,
  WidgetBackgrounds
} from "@erxes/ui-settings/src/styles";
import { ControlLabel } from "@erxes/ui/src/components/form";
import Popover from "@erxes/ui/src/components/Popover";
import { FlexItem, LeftItem } from "@erxes/ui/src/components/step/styles";
import { ColorPick, ColorPicker } from "@erxes/ui/src/styles/main";
import { __, uploadHandler } from "@erxes/ui/src/utils";
import { readFile } from '@erxes/ui/src/utils/core';
import classnames from "classnames";
import React from "react";
import TwitterPicker from "react-color/lib/Twitter";

type Props = {
  onChange: (
    name:
      | "logoPreviewStyle"
      | "logo"
      | "logoPreviewUrl"
      | "wallpaper"
      | "color"
      | "textColor",
    value: string
  ) => void;
  color: string;
  textColor: string;
  logoPreviewUrl?: string;
  wallpaper: string;
};

type State = {
  wallpaper: string;
  logoPreviewStyle: any;
  logo: object;
  logoPreviewUrl: object;
};

class Appearance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      wallpaper: props.wallpaper,
      logoPreviewStyle: {},
      logo: {},
      logoPreviewUrl: {}
    };
  }

  onChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.props.onChange(name, value);
    this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
  };

  handleLogoChange = e => {
    const imageFile = e.target.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.onChange("logoPreviewStyle", { opacity: "0.7" });
      },

      afterUpload: ({ response }) => {
        this.onChange("logo", response);
        this.onChange("logoPreviewStyle", { opacity: "1" });
      },

      afterRead: ({ result }) => {
        this.onChange("logoPreviewUrl", result);
      }
    });
  };

  renderWallpaperSelect(value) {
    const isSelected = this.state.wallpaper === value;
    const selectorClass = classnames({ selected: isSelected });

    const onClick = () => this.onChange("wallpaper", value);

    return (
      <BackgroundSelector
        className={selectorClass}
        onClick={onClick}
        style={{ borderColor: isSelected ? this.props.color : "transparent" }}
      >
        <div className={`background-${value}`} />
      </BackgroundSelector>
    );
  }

  renderUploadImage(title) {
    const { logoPreviewUrl, color } = this.props;

    return (
      <SubItem>
        <ControlLabel>{title}</ControlLabel>
        {logoPreviewUrl && 
          <LogoWrapper backgroundColor={color}>
            <img src={readFile(logoPreviewUrl)} alt="Preview" />
          </LogoWrapper>
        }
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={this.handleLogoChange}
        />
      </SubItem>
    );
  }

  render() {
    const { color, textColor, onChange } = this.props;
    const onChangeColor = (key, e) => onChange(key, e.hex);

    return (
      <FlexItem>
        <LeftItem>
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
                onChange={onChangeColor.bind(this, "color")}
                triangle="hide"
              />
            </Popover>
          </SubItem>
          <SubItem>
            <ControlLabel>{__("Choose a text color")}</ControlLabel>
            <Popover
              trigger={
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: textColor }} />
                </ColorPick>
              }
              placement="bottom-start"
            >
              <TwitterPicker
                color={textColor}
                onChange={onChangeColor.bind(this, "textColor")}
                colors={TEXT_COLORS}
                triangle="hide"
              />
            </Popover>
          </SubItem>

          <SubItem>
            <ControlLabel>Choose a wallpaper</ControlLabel>

            <WidgetBackgrounds>
              {this.renderWallpaperSelect("1")}
              {this.renderWallpaperSelect("2")}
              {this.renderWallpaperSelect("3")}
              {this.renderWallpaperSelect("4")}
              {this.renderWallpaperSelect("5")}
            </WidgetBackgrounds>
          </SubItem>

          {this.renderUploadImage(__("Choose a logo"))}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Appearance;
