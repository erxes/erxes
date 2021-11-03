import {
  FlexItem as FlexItemContainer,
  LeftItem
} from 'modules/common/components/step/styles';
import { FlexItem } from 'modules/layout/styles';
import { COLORS } from 'modules/boards/constants';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { ControlLabel, FormGroup } from 'modules/common/components/form';
import Select from 'react-select-plus';
import {
  ColorPick,
  ColorPicker,
  SubHeading,
  WidgetBackgrounds
} from 'modules/settings/styles';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import React from 'react';
import { BOOKING_ITEM_SHAPE } from 'modules/bookings/constants';
import { FlexContent } from 'modules/boards/styles/item';
import { FONTS } from 'modules/settings/clientPortal/constants';

type Name =
  | 'itemShape'
  | 'widgetColor'
  | 'productSelected'
  | 'textAvailable'
  | 'baseFont';

type Props = {
  onChangeBooking: (name: Name, value: any) => void;
  itemShape: string;
  widgetColor: string;
  productAvailable: string;
  textAvailable: string;
  baseFont: string;
};

function Style({
  onChangeBooking,
  itemShape,
  widgetColor,
  productAvailable,
  textAvailable,
  baseFont
}: Props) {
  const renderColorSelect = (item, color) => {
    const popoverBottom = (
      <Popover id="color-picker">
        <TwitterPicker
          width="266px"
          triangle="hide"
          color={color}
          onChange={e => onChangeBooking(item, e.hex)}
          colors={COLORS}
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom-start"
        overlay={popoverBottom}
      >
        <ColorPick>
          <ColorPicker style={{ backgroundColor: color }} />
        </ColorPick>
      </OverlayTrigger>
    );
  };

  return (
    <FlexItemContainer>
      <LeftItem>
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel required={true}>Item Shape</ControlLabel>
              <Select
                clearable={false}
                value={itemShape}
                onChange={(e: any) => onChangeBooking('itemShape', e.value)}
                options={BOOKING_ITEM_SHAPE.ALL_LIST.map(e => ({
                  value: e.value,
                  label: e.label
                }))}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Base Font</ControlLabel>
              <Select
                placeholder="Please select a font"
                value={baseFont}
                options={FONTS.map(item => ({ label: item, value: item }))}
                onChange={(e: any) =>
                  onChangeBooking('baseFont', e ? e.value : null)
                }
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <SubHeading>
          Colors
          <span>Choose a widget main and navigation colors</span>
        </SubHeading>

        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Main Widget Color</ControlLabel>
              <WidgetBackgrounds>
                {renderColorSelect('widgetColor', widgetColor)}
              </WidgetBackgrounds>
            </FormGroup>
          </FlexItem>

          <FlexItem>
            <ControlLabel>Available Product Color</ControlLabel>
            <WidgetBackgrounds>
              {renderColorSelect('productAvailable', productAvailable)}
            </WidgetBackgrounds>
          </FlexItem>

          <FlexItem>
            <ControlLabel>Available Text Color</ControlLabel>
            <WidgetBackgrounds>
              {renderColorSelect('textAvailable', textAvailable)}
            </WidgetBackgrounds>
          </FlexItem>
        </FlexContent>
      </LeftItem>
    </FlexItemContainer>
  );
}

export default Style;
