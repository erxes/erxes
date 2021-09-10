import React, { useState } from 'react';
import { Description, SubHeading } from 'modules/settings/styles';
import { FlexItem } from 'modules/layout/styles';
import { FlexContent } from 'modules/boards/styles/item';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import Select from 'react-select-plus';
import { FlexItem as FlexItemContainer, Title } from './style';

import { PRODUCT_PROPERTIES, USER_FILTERS } from 'modules/bookings/constants';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';

function ChooseSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    name: '',
    image: [] as IAttachment[],
    description: '',
    filters: []
  });

  const [productDetail, setProductDetail] = useState({
    category: '',
    formId: '',
    buttonText: '',
    properties: []
  });

  // general settings onChange
  const onChangeFilters = option => {
    setGeneralSettings({
      ...generalSettings,
      filters: option
    });
  };

  const onChangeGeneralName = e => {
    setGeneralSettings({
      ...generalSettings,
      name: e.target.value
    });
  };

  const onChangeGeneralImage = (attachment: IAttachment[]) => {
    setGeneralSettings({
      ...generalSettings,
      image: attachment
    });
  };

  const onChangeGeneralDesciption = e => {
    setGeneralSettings({
      ...generalSettings,
      description: e.target.value
    });
  };

  const renderFilterSelectOptions = () => {
    return USER_FILTERS.ALL_LIST.map(el => ({
      value: el.value,
      label: el.label
    }));
  };

  // product detail onChange
  const onChangeCategory = option => {
    setProductDetail({
      ...productDetail,
      category: option
    });
  };

  const renderPropertyOptions = () => {
    return PRODUCT_PROPERTIES.ALL_LIST.map(el => ({
      value: el.value,
      label: el.label
    }));
  };

  const onChangeProperties = option => {
    setProductDetail({
      ...productDetail,
      properties: option
    });
  };

  const renderGeneralSettings = () => {
    return (
      <>
        <SubHeading>{__('General')}</SubHeading>

        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                value={generalSettings.name}
                onChange={onChangeGeneralName}
              />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>
              <Uploader
                defaultFileList={generalSettings.image}
                onChange={onChangeGeneralImage}
                single={true}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            value={generalSettings.description}
            onChange={onChangeGeneralDesciption}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User filters</ControlLabel>
          <Select
            multi={true}
            value={generalSettings.filters}
            onChange={onChangeFilters}
            options={renderFilterSelectOptions()}
            clearable={true}
          />
        </FormGroup>
      </>
    );
  };

  const renderProductDetail = () => {
    return (
      <>
        <SubHeading>{__('Product Details')}</SubHeading>

        <br />
        <Title>{__('Main Product Category')}</Title>
        <Description>
          {__(
            `Select the main Product Category of the products and services you want to display. If you haven't created one, please go to to organize your product first.`
          )}
        </Description>

        <FlexContent>
          <FlexItem>
            <FormGroup>
              <Select
                value={productDetail.category}
                onChange={onChangeCategory}
              />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Form to display</ControlLabel>
              <Select value={productDetail.formId} />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Properties to display</ControlLabel>
          <Select
            multi={true}
            value={productDetail.properties}
            options={renderPropertyOptions()}
            onChange={onChangeProperties}
          />
        </FormGroup>
      </>
    );
  };

  return (
    <FlexItemContainer>
      <LeftItem>
        {renderGeneralSettings()}
        {renderProductDetail()}
      </LeftItem>
    </FlexItemContainer>
  );
}

export default ChooseSettings;
