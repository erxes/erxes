import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import FormControl from 'modules/common/components/form/Control';
import { ControlLabel, FormGroup } from 'modules/common/components/form';
import {
  ColorPick,
  ColorPicker,
  SubItem,
  WidgetBackgrounds
} from 'modules/settings/styles';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { __ } from 'modules/common/utils';
import React, { useState } from 'react';

function Style() {
  const [shape, setShape] = useState('');

  const renderSelectOptions = () => {
    return [
      { value: 'triangle', text: 'triangle' },
      { value: 'circle', text: 'circle' }
    ].map(e => {
      return (
        <option key={e.value} value={e.value}>
          {e.text}
        </option>
      );
    });
  };

  const handleShapeChange = () => {
    const element = document.getElementById('shapeAction') as HTMLInputElement;

    const value = element.value;

    setShape(value);
  };

  const renderColorSelect = color => {
    return (
      <OverlayTrigger trigger="click" rootClose={true} placement="bottom-start">
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
            <FormControl
              componentClass="select"
              defaultValue={shape}
              onChange={handleShapeChange}
              id="shapeAction"
            >
              {renderSelectOptions()}
            </FormControl>
          </FormGroup>
        </SubItem>

        <SubItem>
          <ControlLabel>{__('Choose a card colors')}</ControlLabel>

          <WidgetBackgrounds>
            {renderColorSelect('#fff')}
            {renderColorSelect('#3CCC38')}
            {renderColorSelect('#5629B6')}
          </WidgetBackgrounds>
        </SubItem>
      </LeftItem>
    </FlexItem>
  );
}

export default Style;
