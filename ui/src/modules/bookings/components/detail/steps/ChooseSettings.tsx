import React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';

function ChooseSettings() {
  return (
    <FlexItem>
      <LeftItem>
        <FormGroup>
          <ControlLabel>Hello world</ControlLabel>
          <FormControl />
        </FormGroup>
      </LeftItem>
    </FlexItem>
  );
}

export default ChooseSettings;
