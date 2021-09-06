import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import React, { useState } from 'react';

function ChooseContent() {
  const [type, setType] = useState('');

  const renderSelectOptions = () => {
    return [
      { value: 'hahaaha', text: 'hahah' },
      {
        value: 'hehehe',
        text: 'hehehee'
      }
    ].map(el => {
      return (
        <option key={el.value} value={el.value}>
          {el.text}
        </option>
      );
    });
  };

  const handleTypeChange = () => {
    const element = document.getElementById('typeAction') as HTMLInputElement;
    const value = element.value;
    setType(value);
  };

  return (
    <FlexItem>
      <LeftItem>
        <FormGroup>
          <ControlLabel>Item type</ControlLabel>
          <FormControl
            componentClass="select"
            defaultValue={type}
            onChange={handleTypeChange}
            id="typeAction"
          >
            {renderSelectOptions()}
          </FormControl>
        </FormGroup>
      </LeftItem>
    </FlexItem>
  );
}

export default ChooseContent;
