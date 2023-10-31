import AvatarUpload from '@erxes/ui/src/components/AvatarUpload';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import Select from 'react-select-plus';

import { COLORS, FONTS } from '../../constants';
import {
  Block,
  ColorChooserTile,
  ColorPickerWrap,
  FlexRow,
  LogoWrapper
} from '../../styles';
import { Styles } from '../../types';

type Props = {
  styles?: Styles;
  icon?: string;
  logo?: string;
  headerHtml?: string;
  footerHtml?: string;
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
  logo = '',
  headerHtml = '',
  footerHtml = ''
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

  const handleAvatarUploader = (name: string, url: string) => {
    handleFormChange(name, url);
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
              <p>{__('Business portal main logo PNG')}.</p>
              <AvatarUpload
                avatar={logo}
                onAvatarUpload={logoUrl =>
                  handleAvatarUploader('logo', logoUrl)
                }
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Favicon</ControlLabel>
              <p>{__('16x16px transparent PNG')}.</p>
              <AvatarUpload
                avatar={icon}
                onAvatarUpload={iconUrl =>
                  handleAvatarUploader('icon', iconUrl)
                }
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

  const onHeaderChange = e => {
    handleFormChange('headerHtml', e.editor.getData());
  };

  const onFooterChange = e => {
    handleFormChange('footerHtml', e.editor.getData());
  };

  return (
    <>
      {renderLogos()}
      {renderColors()}
      {renderFonts()}
      {renderFormElements()}

      <Block>
        <h4>{__('Advanced')}</h4>

        <FlexContent>
          <FormGroup>
            <ControlLabel>Header html</ControlLabel>

            <EditorCK
              content={headerHtml}
              onChange={onHeaderChange}
              height={200}
              name="clientportal-header"
            />
          </FormGroup>
        </FlexContent>

        <FlexContent>
          <FormGroup>
            <ControlLabel>Footer html</ControlLabel>

            <EditorCK
              content={footerHtml}
              onChange={onFooterChange}
              height={200}
              name="clientportal-footer"
            />
          </FormGroup>
        </FlexContent>
      </Block>
    </>
  );
}

export default Appearance;
