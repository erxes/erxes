import { ControlLabel } from 'modules/common/components/form';
import { LeftItem } from 'erxes-ui/lib/components/step/styles';
import { __, uploadHandler, FormGroup } from 'erxes-ui';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import {
  AppearanceRow,
  ColorPick,
  ColorPicker,
  FlexItem,
  SubItem
} from '../../../styles';
import { TEXT_COLORS } from '../../../constants';

interface IColor {
  [key: string]: string;
}

export interface IUIOptions {
  backgroundColors: IColor;
  tabColors: IColor;
  textColors: IColor;
  buttonColors: IColor;
  logo: string;
  bgImage: string;
}

type Props = {
  onChange: (
    name: 'uiOptions' | 'logoPreviewUrl' | 'logoPreviewStyle',
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

    this.state = {
      uiOptions
    };
  }

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onChangeAppearance = (name: any, value: any) => {
    this.props.onChangeAppearance(name, value);
  };

  handleLogoChange = e => {
    const { uiOptions } = this.props;
    const imageFile = e.target.files;

    const key = e.target.id;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.onChangeFunction('logoPreviewStyle', { opacity: '0.7' });
      },

      afterUpload: ({ response }) => {
        uiOptions[key] = response;
        this.onChangeFunction('uiOptions', uiOptions);
        this.onChangeFunction('logoPreviewStyle', { opacity: '1' });
      },

      afterRead: ({ result }) => {
        this.onChangeFunction('logoPreviewUrl', result);
      }
    });
  };

  renderUploadImage(id, title) {
    return (
      <SubItem>
        <ControlLabel>{title}</ControlLabel>
        <input id={id} type="file" onChange={this.handleLogoChange} />
      </SubItem>
    );
  }

  renderPicker(group, key, title) {
    const { uiOptions } = this.props;
    const color = uiOptions[group][key] || '';

    const onChangeColor = e => {
      uiOptions[group][key] = e.hex;

      this.onChangeFunction('uiOptions', uiOptions);
    };

    const popoverContent = (
      <Popover id={key}>
        <TwitterPicker color={color} onChange={onChangeColor} triangle="hide" />
      </Popover>
    );

    return (
      <SubItem>
        <label>{title}</label>
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
      </SubItem>
    );
  }

  render() {
    const { pos } = this.props;
    const { uiOptions } = this.state;
    const { color = '', textColor = '' } = uiOptions;

    const onChangeColor = (key, e) => {
      uiOptions[key] = e.hex;
      pos.uiOptions = uiOptions;
      this.onChangeFunction('pos', pos);
    };

    const popoverContent = (
      <Popover id="color-picker">
        <TwitterPicker
          color={color}
          onChange={onChangeColor.bind(this, 'color')}
          triangle="hide"
        />
      </Popover>
    );

    const textColorContent = (
      <Popover id="text-color-picker">
        <TwitterPicker
          color={textColor}
          onChange={onChangeColor.bind(this, 'textColor')}
          colors={TEXT_COLORS}
          triangle="hide"
        />
      </Popover>
    );

    return (
      <FlexItem>
        <LeftItem>
          <AppearanceRow>
            {this.renderUploadImage('logo', __('Logo'))}

            {this.renderUploadImage('bgImage', __('BackGround Image'))}
          </AppearanceRow>
          <FormGroup>
            <ControlLabel>{__('Background colors')}</ControlLabel>
            <AppearanceRow>
              {this.renderPicker('backgroundColors', 'bodyColor', 'Body')}
              {this.renderPicker('backgroundColors', 'headerColor', 'Header')}
              {this.renderPicker('backgroundColors', 'footerColor', 'Footer')}
            </AppearanceRow>
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Tab colors')}</ControlLabel>
            <AppearanceRow>
              {this.renderPicker('tabColors', 'defaultColor', 'Default')}
              {this.renderPicker('tabColors', 'selectedColor', 'Selected')}
            </AppearanceRow>
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Text colors')}</ControlLabel>
            <AppearanceRow>
              {this.renderPicker('textColors', 'bodyTextColor', 'Default')}
              {this.renderPicker('textColors', 'linkColor', 'Links')}
              {this.renderPicker(
                'textColors',
                'linkHoverColor',
                'Link hovered'
              )}
              {this.renderPicker(
                'textColors',
                'linkPressedColor',
                'Link pressed'
              )}
            </AppearanceRow>
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Buttons')}</ControlLabel>
            <AppearanceRow>
              {this.renderPicker('buttonColors', 'defaultColor', 'Default')}
              {this.renderPicker('buttonColors', 'pressedColor', 'Pressed')}
            </AppearanceRow>
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Appearance;
