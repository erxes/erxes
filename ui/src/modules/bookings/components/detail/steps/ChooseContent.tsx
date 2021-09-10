import { FlexContent } from 'modules/boards/styles/item';
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
import Select from 'react-select-plus';

function ChooseContent() {
  // const onChangeFloorAttachment = (files: IAttachment[]) => {
  //   setFloorAttachments(files);
  // };

  const renderBlockContent = () => {
    return (
      <>
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Block Selection Title</ControlLabel>
              <FormControl />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel required={true}>Product Property</ControlLabel>
              <Select />
            </FormGroup>
          </FlexItem>
        </FlexContent>
        <FormGroup>
          <ControlLabel>Block Selection Description</ControlLabel>
          <FormControl />
        </FormGroup>

        <FlexContent>
          <FlexItem count={3}>
            <FormGroup>
              <ControlLabel>Display blocks</ControlLabel>
              <Select />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Columns</ControlLabel>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Rows</ControlLabel>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Margin</ControlLabel>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </>
    );
  };

  return (
    <FlexItemContainer>
      <LeftItem>{renderBlockContent()}</LeftItem>
    </FlexItemContainer>
  );
}

export default ChooseContent;
