import { FlexContent } from 'modules/boards/styles/item';
import Select from 'react-select-plus';
import { LANGUAGES } from 'modules/settings/general/constants';
import SelectBrand from 'modules/settings/integrations/containers/SelectBrand';
import { LeftItem } from 'modules/common/components/step/styles';
// import { SubHeading } from 'modules/settings/styles';
// import Uploader from 'modules/common/components/Uploader';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { __ } from 'modules/common/utils';
import { FlexItem } from 'modules/layout/styles';
import { FlexItem as FlexItemContainer } from './style';
import React from 'react';
// import Select from 'react-select-plus';
// import { SubHeading } from 'modules/settings/styles';
import { Description } from 'modules/settings/styles';
import SelectChannels from 'modules/settings/integrations/containers/SelectChannels';

type Props = {
  onChange: (name: string, value: any) => void;
};

function ChooseSettings(props: Props) {
  return (
    <FlexItemContainer>
      <LeftItem>
        <FormGroup>
          <ControlLabel required={true}>Booking Title</ControlLabel>
          <Description>
            Name this widget to differentiate from the rest internally.
          </Description>
          <FormControl />
        </FormGroup>

        <FormGroup>
          <SelectBrand required={true} />
        </FormGroup>

        <FormGroup>
          <SelectChannels />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Language</ControlLabel>
          <Select
            placeholder="Choose language"
            options={LANGUAGES.map(el => ({
              label: el.label,
              value: el.value
            }))}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Product Availability Status</ControlLabel>
          <Select placeholder="Choose status" />
        </FormGroup>

        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel required={true}>Form to display</ControlLabel>
              <Select placeholder="Choose form" />
            </FormGroup>
          </FlexItem>
          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel required={true}>Form Button Text</ControlLabel>
              <FormControl />
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </LeftItem>
    </FlexItemContainer>
  );
}

export default ChooseSettings;
