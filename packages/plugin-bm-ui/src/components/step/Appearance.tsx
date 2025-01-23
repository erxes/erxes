import ControlLabel from '@erxes/ui/src/components/form/Label';
import Popover from '@erxes/ui/src/components/Popover';
import React, { useState } from 'react';
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
} from '../../styles';

interface IColor {
  [key: string]: string;
}

export interface IUIOptions {
  colors: IColor;
  logo: string;
  bgImage: string;
  favIcon: string;
  receiptIcon: string;
  kioskHeaderImage: string;
  mobileAppImage: string;
  qrCodeImage: string;
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
const Appearance = (props: Props) => {
  const { logoPreviewUrl, onChange } = props;

  const [uiOptions, setUiOptions] = useState(
    props.uiOptions || {
      colors: {},
      logo: '',
      texts: {}
    }
  );

  const onChangeFunction = (name: any, value: any) => {
    onChange(name, value);
  };

  const handleLogoChange = (id, url) => {
    setUiOptions(prevOptions => ({ ...prevOptions, [id]: url }));
    onChange('uiOptions', { ...uiOptions, [id]: url });
  };

  const renderUploadImage = (id, title, desc) => {
    return (
      <LogoWrapper>
        <FormGroup>
          <ControlLabel>{__(title)}</ControlLabel>
          <p>{__(desc)}</p>
          <AvatarUpload
            avatar={uiOptions[id]}
            onAvatarUpload={handleLogoChange.bind(this, id)}
          />
        </FormGroup>
      </LogoWrapper>
    );
  };

  const renderInput = (key: string, title?: string, description?: string) => {
    const onChangeInput = e => {
      const newUiOptions = {
        ...uiOptions,
        texts: { ...uiOptions.texts, [key]: e.target.value }
      };

      setUiOptions(newUiOptions);
      onChangeFunction('uiOptions', newUiOptions);
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

  const renderPicker = (group, key, title, colour) => {
    const onChangeColor = e => {
      const newUiOptions = {
        ...uiOptions,
        [group]: { ...uiOptions[group], [key]: e.hex }
      };

      setUiOptions(newUiOptions);
      onChangeFunction('uiOptions', newUiOptions);
    };

    const color =
      uiOptions[group] && uiOptions[group][key]
        ? uiOptions[group][key]
        : colour;

    return (
      <FormGroup>
        <ColorChooserTile>{title}</ColorChooserTile>
        <div>
          <Popover
            trigger={
              <ColorPick>
                <ColorPicker style={{ backgroundColor: color }} />
              </ColorPick>
            }
            placement='bottom-start'
          >
            <TwitterPicker
              color={color}
              onChange={onChangeColor}
              triangle='hide'
            />
          </Popover>
        </div>
      </FormGroup>
    );
  };

  return (
    <FlexItem>
      <LeftItem>
        <Block>
          <h4>{__('Logo')}</h4>
          <AppearanceRow>
            {renderUploadImage('logo', 'Main Logo', 'main logo PNG')}
          </AppearanceRow>
        </Block>
        <Block>
          <h4>{__('Main colors')}</h4>
          <FormGroup>
            <ControlLabel>{__('Colors')}</ControlLabel>
            <AppearanceRow>
              <ColorPickerWrap>
                {renderPicker('colors', 'primary', 'Primary', '#6569df')}
                {renderPicker('colors', 'secondary', 'Secondary', '#3fc7cc')}
                {renderPicker('colors', 'third', 'Third', '#3fc700')}
              </ColorPickerWrap>
            </AppearanceRow>
          </FormGroup>
        </Block>
        <Block>
          <h4>{__('Infos')}</h4>
          <FormGroup>{renderInput('website', 'WebSite', '')}</FormGroup>
        </Block>
      </LeftItem>
    </FlexItem>
  );
};

export default Appearance;
