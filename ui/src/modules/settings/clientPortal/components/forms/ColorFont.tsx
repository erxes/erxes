import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { FlexContent } from 'erxes-ui/lib/layout/styles';
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
  SelectWrap,
  TextWrapColor,
  LastColorPicker
} from '../../styles';

type Props = {
  styles?: Styles;
  handleFormChange: (name: string, value: string | object) => void;
};

type Item = {
  label: string;
  name: string;
  value?: string;
};

const generateOptions = () => FONTS.map(item => ({ label: item, value: item }));

function ColorFont({ styles = {}, handleFormChange }: Props) {
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
    headingColor,
    baseFont,
    headingFont
  } = styles;

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
        <ControlLabel>{label}</ControlLabel>
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
        <ControlLabel>
          <TextWrapColor>{label}</TextWrapColor>
        </ControlLabel>
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

  return (
    <>
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
            <LastColorPicker>
              {renderColor({
                label: 'Help Center',
                name: 'helpColor',
                value: helpColor
              })}
            </LastColorPicker>
          </ColorPickerWrap>
        </FlexContent>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Tab colors</ControlLabel>
        <FlexContent>
          <ColorPickerWrap>
            {renderColor({
              label: 'Background',
              name: 'backgroundColor',
              value: backgroundColor
            })}
            <LastColorPicker>
              {renderColor({
                label: 'Active tab',
                name: 'activeTabColor',
                value: activeTabColor
              })}
            </LastColorPicker>
          </ColorPickerWrap>
        </FlexContent>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Portal fonts</ControlLabel>
        <SelectWrap>
          {renderSelect({
            label: 'Base font',
            name: 'baseFont',
            value: baseFont
          })}
        </SelectWrap>
        <ColorPickerWrap>
          <LastColorPicker>
            {renderColor({
              label: 'Base Color',
              name: 'baseColor',
              value: baseColor
            })}
          </LastColorPicker>
        </ColorPickerWrap>
        <SelectWrap>
          {renderSelect({
            label: 'Heading font',
            name: 'headingFont',
            value: headingFont
          })}
        </SelectWrap>
        <ColorPickerWrap>
          <LastColorPicker>
            {renderColor({
              label: 'Heading Color',
              name: 'headingColor',
              value: headingColor
            })}
          </LastColorPicker>
        </ColorPickerWrap>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Link color</ControlLabel>
        <FlexContent>
          <ColorPickerWrap>
            {renderColor({
              label: 'Link text',
              name: 'linkColor',
              value: linkColor
            })}
            <LastColorPicker>
              {renderColor({
                label: 'Link hover text',
                name: 'linkHoverColor',
                value: linkHoverColor
              })}
            </LastColorPicker>
          </ColorPickerWrap>
        </FlexContent>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Form elements</ControlLabel>
        <FlexContent>
          <ColorPickerWrap>
            {renderColor({
              label: 'Heading divider & Input focus glow',
              name: 'dividerColor',
              value: dividerColor
            })}
            {renderColor({
              label: 'Primary action button',
              name: 'primaryBtnColor',
              value: primaryBtnColor
            })}
            <LastColorPicker>
              {renderColor({
                label: 'Secondary action button',
                name: 'secondaryBtnColor',
                value: secondaryBtnColor
              })}
            </LastColorPicker>
          </ColorPickerWrap>
        </FlexContent>
      </FormGroup>
    </>
  );
}

export default ColorFont;
