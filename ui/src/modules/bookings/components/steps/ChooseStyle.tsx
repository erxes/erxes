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
  // SubItem,
  WidgetBackgrounds
} from 'modules/settings/styles';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import React from 'react';
import { BOOKING_ITEM_SHAPE } from 'modules/bookings/constants';
import { FlexContent } from 'modules/boards/styles/item';

type Name =
  | 'itemShape'
  | 'widgetColor'
  | 'productAvailable'
  | 'productUnavailable'
  | 'productSelected'
  | 'textAvailable'
  | 'textUnavailable'
  | 'textSelected';

type Props = {
  onChangeStyle: (name: Name, value: any) => void;

  itemShape: string;
  widgetColor: string;

  productAvailable: string;
  productUnavailable: string;
  productSelected: string;

  textAvailable: string;
  textUnavailable: string;
  textSelected: string;
};

function Style({
  onChangeStyle,
  itemShape,
  widgetColor,
  productAvailable,
  productUnavailable,
  productSelected,
  textAvailable,
  textUnavailable,
  textSelected
}: Props) {
  const renderColorSelect = (item, color) => {
    const popoverBottom = (
      <Popover id="color-picker">
        <TwitterPicker
          width="266px"
          triangle="hide"
          color={color}
          onChange={e => onChangeStyle(item, e.hex)}
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
              <ControlLabel>Item Shape</ControlLabel>
              <Select
                clearable={false}
                value={itemShape}
                onChange={(e: any) => onChangeStyle('itemShape', e.value)}
                options={BOOKING_ITEM_SHAPE.ALL_LIST.map(e => ({
                  value: e.value,
                  label: e.label
                }))}
              />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Widget Color</ControlLabel>
              <WidgetBackgrounds>
                {renderColorSelect('widgetColor', widgetColor)}
              </WidgetBackgrounds>
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <SubHeading>Product Colors</SubHeading>

        <FlexContent>
          <FlexItem>
            <ControlLabel>Available</ControlLabel>
            <WidgetBackgrounds>
              {renderColorSelect('productAvailable', productAvailable)}
            </WidgetBackgrounds>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Unavailable</ControlLabel>
            <WidgetBackgrounds>
              {renderColorSelect('productUnavailable', productUnavailable)}
            </WidgetBackgrounds>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Selected</ControlLabel>
            <WidgetBackgrounds>
              {renderColorSelect('productSelected', productSelected)}
            </WidgetBackgrounds>
          </FlexItem>
        </FlexContent>

        <SubHeading>Text Colors</SubHeading>

        <FlexContent>
          <FlexItem>
            <ControlLabel>Available</ControlLabel>
            <WidgetBackgrounds>
              {renderColorSelect('textAvailable', textAvailable)}
            </WidgetBackgrounds>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Unavailable</ControlLabel>
            <WidgetBackgrounds>
              {renderColorSelect('textUnavailable', textUnavailable)}
            </WidgetBackgrounds>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Select</ControlLabel>
            <WidgetBackgrounds>
              {renderColorSelect('textSelected', textSelected)}
            </WidgetBackgrounds>
          </FlexItem>
        </FlexContent>
      </LeftItem>
    </FlexItemContainer>
  );
}

export default Style;
