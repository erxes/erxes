import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { colors } from 'modules/common/styles';
import { COLORS } from 'modules/boards/constants';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import FormControl from 'modules/common/components/form/Control';
import { ControlLabel, FormGroup } from 'modules/common/components/form';
import Select from 'react-select-plus';
import {
  ColorPick,
  ColorPicker,
  SubItem,
  WidgetBackgrounds
} from 'modules/settings/styles';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { __ } from 'modules/common/utils';
import React, { useState } from 'react';
import { BOOKING_ITEM_SHAPE } from 'modules/bookings/constants';

function Style() {
  const [shape, setShape] = useState(BOOKING_ITEM_SHAPE.CIRCLE);
  const [color, setColor] = useState(colors.colorPrimaryDark);

  const renderSelectOptions = () => {
    return BOOKING_ITEM_SHAPE.ALL_LIST.map(e => ({
      value: e.value,
      label: e.text
    }));
  };

  const handleShapeChange = e => {
    setShape(e.value);
  };

  const onColorChange = e => {
    setColor(e.hex);
  };

  const renderColorSelect = () => {
    const popoverBottom = (
      <Popover id="color-picker">
        <TwitterPicker
          width="266px"
          triangle="hide"
          color={color}
          onChange={onColorChange}
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
    <FlexItem>
      <LeftItem>
        <SubItem>
          <FormGroup>
            <ControlLabel>Item Shape</ControlLabel>
            <Select
              clearable={false}
              value={shape}
              onChange={handleShapeChange}
              options={renderSelectOptions()}
            />
          </FormGroup>
        </SubItem>

        <SubItem>
          <ControlLabel>{__('Card colors')}</ControlLabel>

          <WidgetBackgrounds>{renderColorSelect()}</WidgetBackgrounds>
        </SubItem>
      </LeftItem>
    </FlexItem>
  );
}

export default Style;
