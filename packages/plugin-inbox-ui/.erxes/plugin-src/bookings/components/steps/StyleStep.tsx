import { FlexHeight as FlexItemContainer } from '@erxes/ui/src/styles/main';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { FlexItem } from '@erxes/ui/src/layout/styles';
import { COLORS } from '@erxes/ui/src/constants/colors';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Select from 'react-select-plus';
import {
  SubHeading,
  WidgetBackgrounds
} from '@erxes/ui-settings/src/styles';
import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import React from 'react';
import { BOOKING_ITEM_SHAPE } from '../../constants';
import { Flex } from '@erxes/ui/src/styles/main';
import { FONTS } from '@erxes/ui-settings/src/constants';

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
        <Flex>
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
        </Flex>

        <Flex>
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
        </Flex>

        <SubHeading>
          Colors
          <span>Choose a widget main and navigation colors</span>
        </SubHeading>

        <Flex>
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
        </Flex>
      </LeftItem>
    </FlexItemContainer>
  );
}

export default Style;
