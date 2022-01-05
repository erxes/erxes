import {
  FlexItem as FlexItemContainer,
  LeftItem
} from '@erxes/ui/src/components/step/styles';
import { FlexItem } from '@erxes/ui/src/layout/styles';
import { COLORS } from '@erxes/ui/src/boards/constants';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';
import {
  ColorPick,
  ColorPicker,
  SubHeading,
  WidgetBackgrounds
} from '@erxes/ui/src/settings/styles';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import React from 'react';
import { BOOKING_ITEM_SHAPE } from '../../constants';
import { OnlyFlexContent } from '@erxes/ui/src/styles/main';
import { FONTS } from '@erxes/ui/src/settings/clientPortal/constants';

type Name = 'itemShape' | 'widgetColor' | 'productAvailable' | 'baseFont';

type Props = {
  onChangeBooking: (name: Name, value: any) => void;
  itemShape: string;
  widgetColor: string;
  productAvailable: string;
  baseFont: string;
};

function Style({
  onChangeBooking,
  itemShape,
  widgetColor,
  productAvailable,
  baseFont
}: Props) {
  const renderColorSelect = (item, color) => {
    const popoverBottom = (
      <Popover id='color-picker'>
        <TwitterPicker
          width='266px'
          triangle='hide'
          color={color}
          onChange={e => onChangeBooking(item, e.hex)}
          colors={COLORS}
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger='click'
        rootClose={true}
        placement='bottom-start'
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
        <OnlyFlexContent>
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
        </OnlyFlexContent>

        <OnlyFlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Base Font</ControlLabel>
              <Select
                placeholder='Please select a font'
                value={baseFont}
                options={FONTS.map(item => ({
                  label: item.label,
                  value: item.value
                }))}
                onChange={(e: any) =>
                  onChangeBooking('baseFont', e ? e.value : null)
                }
              />
            </FormGroup>
          </FlexItem>
        </OnlyFlexContent>

        <SubHeading>
          Colors
          <span>Choose a widget main and navigation colors</span>
        </SubHeading>

        <OnlyFlexContent>
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
        </OnlyFlexContent>
      </LeftItem>
    </FlexItemContainer>
  );
}

export default Style;
