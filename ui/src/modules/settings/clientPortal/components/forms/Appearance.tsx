import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';
import { COLORS, FONTS } from '../../constants';
import { Styles } from '../../types';
import {
  ColorPickerWrap,
  ColorChooserTile,
  Block,
  LogoWrapper,
  FlexRow
} from '../../styles';
import { ControlLabel, FormGroup } from 'modules/common/components/form';
import { FlexContent } from 'modules/layout/styles';
import AvatarUpload from 'modules/common/components/AvatarUpload';
import { __ } from 'modules/common/utils';

type Props = {
  styles?: Styles;
  icon?: string;
  logo?: string;
  handleFormChange: (name: string, value: string | object) => void;
};

type Item = {
  label: string;
  name: string;
  value?: string;
};

const generateOptions = () =>
  FONTS.map(item => ({ label: item.label, value: item.value }));

function Appearance({
  styles = {},
  handleFormChange,
  icon = '',
  logo = ''
}: Props) {
  const {
    bodyColor,
    headerColor,
    footerColor,
    helpColor,
    backgroundColor,
    activeTabColor,
    linkColor,
    linkHoverColor,
    primaryBtnColor,
    secondaryBtnColor,
    dividerColor,
    baseColor,
    baseFont,
    headingColor,
    headingFont
  } = styles || ({} as Styles);

  const handleAvatarUploader = (logoUrl: string) => {
    handleFormChange('logo', logoUrl);
  };

  function renderSelect({
    value,
    label,
    name
  }: {
    value?: string;
    label: string;
    name: string;
  }) {
    const handleSelect = (option: { label: string; value: string }) => {
      const currentStyles = { ...styles };

      currentStyles[name] = option.value;

      handleFormChange('styles', currentStyles);
    };

    return (
      <FormGroup>
        <ColorChooserTile>{label}</ColorChooserTile>
        <Select
          placeholder="Please select a font"
          value={value}
          options={generateOptions()}
          onChange={handleSelect}
        />
      </FormGroup>
    );
  }

  function renderColor({ label, name, value }: Item) {
    const handleChange = e => {
      const currentStyles = { ...styles };

      currentStyles[name] = e.hex;

      handleFormChange('styles', currentStyles);
    };

    return (
      <FormGroup>
        <ColorChooserTile>{__(label)}</ColorChooserTile>
        <div>
          <OverlayTrigger
            trigger="click"
            rootClose={true}
            placement="bottom"
            overlay={
              <Popover id={name}>
                <TwitterPicker
                  width="266px"
                  triangle="hide"
                  color={{ hex: value || COLORS[0] }}
                  onChange={handleChange}
                  colors={COLORS}
                />
              </Popover>
            }
          >
            <ColorPick>
              <ColorPicker
                style={{ backgroundColor: value ? value : COLORS[4] }}
              />
            </ColorPick>
          </OverlayTrigger>
        </div>
      </FormGroup>
    );
  }

  const renderLogos = () => {
    return (
      <Block>
        <h4>{__('Logo and favicon')}</h4>
        <LogoWrapper>
          <FlexContent>
            <FormGroup>
              <ControlLabel>Main Logo</ControlLabel>
              <p>{__('Client portal main logo PNG')}.</p>
              <AvatarUpload
                avatar={logo}
                onAvatarUpload={handleAvatarUploader}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Favicon</ControlLabel>
              <p>{__('16x16px transparent PNG')}.</p>
              <AvatarUpload
                avatar={icon}
                onAvatarUpload={handleAvatarUploader}
              />
            </FormGroup>
          </FlexContent>
        </LogoWrapper>
      </Block>
    );
  };

  const renderColors = () => {
    return (
      <Block>
        <h4>{__('Main colors')}</h4>
        <FormGroup>
          <ControlLabel>Background color</ControlLabel>
          <FlexContent>
            <ColorPickerWrap>
              {renderColor({
                label: 'Body',
                name: 'bodyColor',
                value: bodyColor
              })}
              {renderColor({
                label: 'Header',
                name: 'headerColor',
                value: headerColor
              })}
              {renderColor({
                label: 'Footer',
                name: 'footerColor',
                value: footerColor
              })}
              {renderColor({
                label: 'Help Center',
                name: 'helpColor',
                value: helpColor
              })}
              {renderColor({
                label: 'Background',
                name: 'backgroundColor',
                value: backgroundColor
              })}
              {renderColor({
                label: 'Active tab',
                name: 'activeTabColor',
                value: activeTabColor
              })}
            </ColorPickerWrap>
          </FlexContent>
        </FormGroup>
      </Block>
    );
  };

  const renderFonts = () => {
    return (
      <Block>
        <h4>{__('Fonts and color')}</h4>
        <FlexRow>
          <FormGroup>
            <ControlLabel>Base Font</ControlLabel>
            <ColorPickerWrap>
              {renderSelect({
                label: 'Base font',
                name: 'baseFont',
                value: baseFont
              })}
              {renderColor({
                label: 'Base Color',
                name: 'baseColor',
                value: baseColor
              })}
            </ColorPickerWrap>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Heading Font</ControlLabel>
            <ColorPickerWrap>
              {renderSelect({
                label: 'Heading font',
                name: 'headingFont',
                value: headingFont
              })}
              {renderColor({
                label: 'Heading Color',
                name: 'headingColor',
                value: headingColor
              })}
            </ColorPickerWrap>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Link color</ControlLabel>

            <ColorPickerWrap>
              {renderColor({
                label: 'Link text',
                name: 'linkColor',
                value: linkColor
              })}
              {renderColor({
                label: 'Link hover text',
                name: 'linkHoverColor',
                value: linkHoverColor
              })}
            </ColorPickerWrap>
          </FormGroup>
        </FlexRow>
      </Block>
    );
  };

  const renderFormElements = () => {
    return (
      <Block>
        <h4>{__('Form elements color')}</h4>
        <FlexContent>
          <ColorPickerWrap>
            {renderColor({
              label: 'Primary action button',
              name: 'primaryBtnColor',
              value: primaryBtnColor
            })}
            {renderColor({
              label: 'Secondary action button',
              name: 'secondaryBtnColor',
              value: secondaryBtnColor
            })}
            {renderColor({
              label: 'Heading divider & Input focus glow',
              name: 'dividerColor',
              value: dividerColor
            })}
          </ColorPickerWrap>
        </FlexContent>
      </Block>
    );
  };

  return (
    <>
      {renderLogos()}
      {renderColors()}
      {renderFonts()}
      {renderFormElements()}
    </>
  );
}

export default Appearance;
