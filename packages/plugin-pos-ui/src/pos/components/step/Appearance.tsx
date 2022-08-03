import ControlLabel from '@erxes/ui/src/components/form/Label';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React from 'react';
import TwitterPicker from 'react-color/lib/Twitter';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { __, AvatarUpload, FormControl, FormGroup } from '@erxes/ui/src';
import {
  AppearanceRow,
  ColorPick,
  ColorPicker,
  FlexItem,
  Block,
  LogoWrapper,
  ColorPickerWrap,
  ColorChooserTile
} from '../../../styles';

interface IColor {
  [key: string]: string;
}

export interface IUIOptions {
  colors: IColor;
  logo: string;
  bgImage: string;
  favIcon: string;
  receiptIcon: string;
  texts: IColor;
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

    const uiOptions = props.uiOptions || {
      colors: {},
      logo: '',
      favIcon: '',
      bgImage: '',
      receiptIcon: '',
      texts: {},
      kioskHeaderImage: '',
      mobileAppImage: '',
      qrCodeImage: ''
    };

    if (!uiOptions.colors) {
      uiOptions.colors = {};
    }

    if (!uiOptions.texts) {
      uiOptions.texts = {};
    }

    this.state = { uiOptions };
  }

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  handleLogoChange = (id, url) => {
    const { onChange } = this.props;
    const { uiOptions } = this.state;

    this.setState({ uiOptions: { ...uiOptions, [id]: url } });
    onChange('uiOptions', { ...uiOptions, [id]: url });
  };

  renderUploadImage(id, title, desc) {
    const { uiOptions } = this.state;
    return (
      <LogoWrapper>
        <FormGroup>
          <ControlLabel>{__(title)}</ControlLabel>
          <p>{__(desc)}</p>
          <AvatarUpload
            avatar={uiOptions[id]}
            onAvatarUpload={this.handleLogoChange.bind(this, id)}
          />
        </FormGroup>
      </LogoWrapper>
    );
  }

  renderInput = (key: string, title?: string, description?: string) => {
    const { uiOptions } = this.state;

    const onChangeInput = e => {
      uiOptions['texts'][key] = e.target.value;

      this.onChangeFunction('uiOptions', uiOptions);
    };

    const defaultValue = (uiOptions['texts'] || {})[key];
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl defaultValue={defaultValue} onChange={onChangeInput} />
      </FormGroup>
    );
  };

  renderPicker(group, key, title, colour) {
    const { uiOptions } = this.state;

    const color =
      uiOptions[group] && uiOptions[group][key]
        ? uiOptions[group][key]
        : colour;

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
            <h4>{__('Logo and favicon')}</h4>
            <AppearanceRow>
              {this.renderUploadImage('logo', 'Main Logo', 'Pos main logo PNG')}
              {this.renderUploadImage(
                'bgImage',
                'Background Image',
                'Pos background Image PNG'
              )}
              {this.renderUploadImage(
                'favIcon',
                'Favicon',
                '16x16px transparent PNG'
              )}
              {this.renderUploadImage(
                'receiptIcon',
                'Receipt icon',
                '16x16px transparent PNG'
              )}
              {this.renderUploadImage(
                'kioskHeaderImage',
                'Kiosk header image',
                'Kiosk header image PNG'
              )}
              {this.renderUploadImage(
                'mobileAppImage',
                'Mobile app image',
                'Mobile app image PNG'
              )}
              {this.renderUploadImage(
                'qrCodeImage',
                'QR code image',
                'QR code image PNG'
              )}
            </AppearanceRow>
          </Block>
          <Block>
            <h4>{__('Main colors')}</h4>
            <FormGroup>
              <ControlLabel>{__('Colors')}</ControlLabel>
              <AppearanceRow>
                <ColorPickerWrap>
                  {this.renderPicker('colors', 'primary', 'Primary', '#6569df')}
                  {this.renderPicker(
                    'colors',
                    'secondary',
                    'Secondary',
                    '#3fc7cc'
                  )}
                  {this.renderPicker('colors', 'third', 'Third', '#3fc700')}
                </ColorPickerWrap>
              </AppearanceRow>
            </FormGroup>
          </Block>
          <Block>
            <h4>{__('Infos')}</h4>
            <FormGroup>
              {this.renderInput('website', 'WebSite', '')}
              {this.renderInput('phone', 'Phone', '')}
            </FormGroup>
          </Block>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Appearance;
