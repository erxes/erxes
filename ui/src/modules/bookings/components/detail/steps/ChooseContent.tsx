import { BOOKING_CONTENT_ACTION } from 'modules/bookings/constants';
import { LeftItem } from 'modules/common/components/step/styles';
import { SubHeading } from 'modules/settings/styles';
import Uploader from 'modules/common/components/Uploader';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { __ } from 'modules/common/utils';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import { FlexItem as FlexItemContainer } from './style';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { IAttachment } from 'erxes-ui/lib/types';

function ChooseContent() {
  const [type, setType] = useState(BOOKING_CONTENT_ACTION.ONEPAGE);
  const [floorAttachments, setFloorAttachments] = useState([] as IAttachment[]);

  const renderSelectOptions = () => {
    return BOOKING_CONTENT_ACTION.ALL_LIST.map(el => ({
      value: el.value,
      label: el.text
    }));
  };

  const handleTypeChange = e => {
    setType(e.value);
  };

  const onChangeFloorAttachment = (files: IAttachment[]) => {
    setFloorAttachments(files);
  };

  const renderFloorPlans = () => {
    return (
      <>
        <SubHeading>{__('Floorplan')}</SubHeading>

        <FormGroup>
          <label>Title</label>
          <FormControl type="text" />
        </FormGroup>

        <FormGroup>
          <label>Description</label>
          <FormControl type="text" />
        </FormGroup>

        <FlexContent>
          <FlexItem count={2} hasSpace={true}>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>
              <Uploader
                defaultFileList={floorAttachments}
                onChange={onChangeFloorAttachment}
              />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <ControlLabel>Columns</ControlLabel>
              <FormControl type="number" defaultValue={0} />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <ControlLabel>Rows</ControlLabel>
              <FormControl type="number" defaultValue={0} />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <ControlLabel>Margin</ControlLabel>
              <FormControl type="number" defaultValue={0} />
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </>
    );
  };

  const renderFloors = () => {
    return (
      <>
        <SubHeading>{__('Floors')}</SubHeading>

        <FlexContent>
          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Title</ControlLabel>
              <FormControl type="text" />
            </FormGroup>
          </FlexItem>
          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>
              <Uploader
                defaultFileList={floorAttachments}
                onChange={onChangeFloorAttachment}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" />
        </FormGroup>

        <FlexContent>
          <FlexItem count={3} hasSpace={true}>
            <FormGroup>
              <ControlLabel>Layout Stacking</ControlLabel>
              <Select />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <label>Columns</label>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <label>Rows</label>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <label>Margin</label>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </>
    );
  };

  const renderBuildings = () => {
    return (
      <>
        <SubHeading>{__('Buildings')}</SubHeading>

        <FlexContent>
          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Title</ControlLabel>
              <FormControl type="text" />
            </FormGroup>
          </FlexItem>
          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>
              <Uploader
                defaultFileList={floorAttachments}
                onChange={onChangeFloorAttachment}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" />
        </FormGroup>

        <FlexContent>
          <FlexItem count={3} hasSpace={true}>
            <FormGroup>
              <ControlLabel>Layout Stacking</ControlLabel>
              <Select />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <label>Columns</label>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <label>Rows</label>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>

          <FlexItem count={1} hasSpace={true}>
            <FormGroup>
              <label>Margin</label>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </>
    );
  };

  const renderOnePage = () => {
    if (type !== BOOKING_CONTENT_ACTION.ONEPAGE) {
      return null;
    }

    return <div>{renderFloorPlans()}</div>;
  };

  const renderTwoPage = () => {
    if (type !== BOOKING_CONTENT_ACTION.TWOPAGE) {
      return null;
    }

    return (
      <div>
        {renderFloors()}
        {renderFloorPlans()}
      </div>
    );
  };

  const renderThreePage = () => {
    if (type !== BOOKING_CONTENT_ACTION.THREEPAGE) {
      return null;
    }

    return (
      <div>
        {renderBuildings()}
        {renderFloors()}
        {renderFloorPlans()}
      </div>
    );
  };

  return (
    <FlexItemContainer>
      <LeftItem>
        <FormGroup>
          <ControlLabel>Item type</ControlLabel>
          <Select
            clearable={true}
            value={type}
            onChange={handleTypeChange}
            options={renderSelectOptions()}
          />
        </FormGroup>
        {renderOnePage()}
        {renderTwoPage()}
        {renderThreePage()}
      </LeftItem>
    </FlexItemContainer>
  );
}

export default ChooseContent;
